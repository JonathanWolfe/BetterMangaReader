'use strict';

function initStorage() {
	/**
	 * Determine how much of our Chrome Sync capactiy is used
	 * @return {Number} Percentage of capactiy used
	 */
	function capacityUsed() {
		return new Promise( ( resolve ) => {
			chrome.storage.sync.getBytesInUse( null, ( bytes ) => {
				const used = bytes / chrome.storage.sync.QUOTA_BYTES;
				const percentFull = used * 100;

				resolve( percentFull.toFixed( 2 ) );
			} );
		} );
	}

	/**
	 * Update the number on the Extension's icon
	 * @return {Number} Number of manga with unread chapters
	 */
	function updateUnreadCount() {
		let unread = 0;

		Object.keys( window.data.state.tracking ).forEach( ( uuid ) => {
			const manga = window.data.state.tracking[ uuid ];

			if ( parseFloat( manga.readTo ) < parseFloat( manga.latestChapter ) ) {
				unread += 1;
			}
		} );

		if ( unread > 0 ) {
			chrome.browserAction.setBadgeText( { text: unread.toString() } );
			chrome.browserAction.setTitle( { title: `${unread} manga updated` } );
		} else {
			chrome.browserAction.setBadgeText( { text: '' } );
			chrome.browserAction.setTitle( { title: 'No manga updates' } );
		}

		return unread;
	}

	/**
	 * Create a mock state object from an Array of compressed manga objects
	 * @param  {Object} compressed Array of compressed manga objects
	 * @return {Object}           Returns a state object
	 */
	function inflateCompressed( compressed ) {
		let promises = [ ];

		if ( compressed ) {
			promises = Object.keys( compressed ).map( ( index ) => window.parsers.updateMangaInfo( compressed[ index ] ) );
		}

		return Promise.all( promises )
			.then( ( mangas ) => {
				const mockState = {
					editDate: ( new Date() ).toISOString(),
					tracking: {},
				};

				mangas.forEach( ( manga ) => {
					mockState.tracking[ window.uuid.v4() ] = manga;
				} );

				console.groupCollapsed( 'Inflated Manga Data' );
				console.table( Object.keys( mockState.tracking ).map( ( uuid ) => {
					const toLog = mockState.tracking[ uuid ];
					toLog.uuid = uuid;
					return toLog;
				} ) );
				console.groupEnd();

				return mockState;
			} );
	}

	/**
	 * Update the state with Chrome's synced version
	 * @return {State} A promise resolving with the global state
	 */
	function getFresh() {
		console.log( 'Updating state from Chrome Storage' );

		return new Promise( ( resolve ) => {
			chrome.storage.sync.get( null, ( response ) => {
				console.log( 'Raw Chrome Storage Response', response );

				let data = { };

				if ( response.compressed ) {
					response.compressed.forEach( ( item, index ) => {
						data[ index ] = item;
					} );
				} else {
					data = response;
				}

				inflateCompressed( data )
					.then( ( mockState ) => {
						window.data.state = mockState;
						return window.data.state;
					} )
					.then( window.query.primeIndexes )
					.then( updateUnreadCount )
					.then( ( ) => resolve( window.data.state ) );

			} );
		} );
	}

	/**
	 * Compress the full sized state down to it's smallest form
	 * because Chrome hates people
	 * @param  {Object} expanded A state object or an array of full sized manga tracking objects
	 * @return {Object}                 Array of the most compressed the manga data can be
	 */
	function compressForStorage( expanded ) {
		let state;

		if ( !expanded.tracking ) {
			state = window.data.state;
		} else {
			state = expanded;
		}

		const uuids = Object.keys( state.tracking );
		const compressed = { };

		uuids.forEach( ( uuid, index ) => {
			const item = state.tracking[ uuid ];
			const shortened = {
				name: item.name,
				url: item.url,
				readTo: item.readTo,
			};

			compressed[ index ] = shortened;
		} );

		console.groupCollapsed( 'Compressed Manga Data' );
		console.table( Object.keys( compressed ).map( ( index ) => compressed[ index ] ) );
		console.groupEnd();

		return compressed;
	}

	/**
	 * Save state changes to Chrome's Sync storage
	 * @return {State} A promise resolving with the global state from Chrome
	 */
	function saveChanges( state ) {
		const expanded = state || window.data.state;

		return new Promise( ( resolve ) => {
			const compressed = compressForStorage( expanded );

			console.log( 'Saving to Chrome Storage', compressed );

			chrome.storage.sync.clear( ( ) => chrome.storage.sync.set( compressed, resolve ) );
		} )
			.then( window.query.primeIndexes )
			.then( updateUnreadCount );
	}

	/**
	 * Mark a manga as having been read to current chapter
	 * @param  {String} uuid UUID of the manga to update
	 * @return {Promise}     Promise of data.saveChanges()
	 */
	function markRead( uuid ) {
		if ( window.data.state.tracking[ uuid ] ) {
			window.data.state.tracking[ uuid ].readTo = window.data.state.tracking[ uuid ].latestChapter;
			return saveChanges();
		}
		return Promise.resolve( false );
	}

	/**
	 * Load an example set of data
	 * @return {Promise} A promise resolving with nothing and logs upon completion
	 */
	function loadExample() {
		const compressed = {
			0: { name: 'Bleach', url: 'mangastream.com/manga/bleach/', readTo: '663' },
			1: { name: 'Fairy Tail', url: 'mangastream.com/manga/fairy_tail/', readTo: '473' },
			2: { name: 'One Piece', url: 'mangatown.com/manga/one_piece/', readTo: '12' },
			3: { name: 'The Gamer', url: 'mangatown.com/manga/the_gamer/', readTo: '118' },
			4: { name: 'UQ Holder!', url: 'mangahere.co/manga/uq_holder/', readTo: '106' },
		};

		console.groupCollapsed( 'Example Manga to be loaded' );
		console.table( compressed );
		console.groupEnd();

		return inflateCompressed( compressed )
			.then( saveChanges )
			.then( ( ) => console.log( 'Done loading example', window.data.state ) )
			.then( getFresh );
	}

	return {

		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: {},
		},

		updateUnreadCount,

		capacityUsed,

		markRead,

		getFresh,
		compressForStorage,
		inflateCompressed,
		saveChanges,
		loadExample,

	};
}

window.data = initStorage();
