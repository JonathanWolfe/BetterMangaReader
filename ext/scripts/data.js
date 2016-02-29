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
			// Get the whole storage
			chrome.storage.sync.get( null, ( response ) => {
				console.log( 'Raw Chrome Storage Response', response );

				// placeholder
				let data = { };

				// Old system of storage
				if ( response.compressed ) {
					// turn aray into object
					response.compressed.forEach( ( item, index ) => {
						data[ index ] = item;
					} );
				} else {
					// inject response directly into placeholder
					data = response;
				}

				// Un-compress the mangas
				inflateCompressed( data )
					.then( ( mockState ) => {
						// Set the mock state as the real state
						window.data.state = mockState;
						return window.data.state;
					} )
					.then( window.query.primeIndexes ) // re-prime our query indexes
					.then( updateUnreadCount ) // update the badge icon
					.then( ( ) => resolve( window.data.state ) ); // return the state

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
		// use the global state if input is invalid
		const state = expanded.tracking ? expanded : window.data.state;
		// keys to loop over
		const uuids = Object.keys( state.tracking );
		// placeholder
		const compressed = { };

		// compress each manga for storage
		uuids.forEach( ( uuid, index ) => {
			const item = state.tracking[ uuid ];
			// only data we can't re-create is name, url, and readTo
			const shortened = {
				name: item.name,
				url: item.url,
				readTo: item.readTo,
			};
			// add it to our placeholder
			compressed[ index ] = shortened;
		} );

		// log for debugging
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
		// use global state if invalid input
		const expanded = state || window.data.state;

		// Setup a promise
		return new Promise( ( resolve ) => {
			// compress the mangas for storage
			const compressed = compressForStorage( expanded );
			// log for debugging
			console.log( 'Saving to Chrome Storage', compressed );
			// clear the storage
			// then set it to the new compressed state
			// then resolve the promise
			chrome.storage.sync.clear( ( ) => chrome.storage.sync.set( compressed, resolve ) );
		} )
			.then( window.query.primeIndexes ) // update the indexes
			.then( updateUnreadCount ); // update the badge icon number
	}

	/**
	 * Mark a manga as having been read to current chapter
	 * @param  {String} uuid UUID of the manga to update
	 * @return {Promise}     Promise of data.saveChanges()
	 */
	function markRead( uuid ) {
		// if it exists
		if ( window.data.state.tracking[ uuid ] ) {
			// set readTo to equal the latestChapter
			window.data.state.tracking[ uuid ].readTo = window.data.state.tracking[ uuid ].latestChapter;
			// save
			return saveChanges();
		}
		// didn't exists so just resolve with a thenable
		return Promise.resolve( false );
	}

	/**
	 * Load an example set of data
	 * @return {Promise} A promise resolving with nothing and logs upon completion
	 */
	function loadExample() {
		// data to load
		const compressed = {
			0: { name: 'Bleach', url: 'mangastream.com/manga/bleach/', readTo: '663' },
			1: { name: 'Fairy Tail', url: 'mangastream.com/manga/fairy_tail/', readTo: '473' },
			2: { name: 'One Piece', url: 'mangatown.com/manga/one_piece/', readTo: '12' },
			3: { name: 'The Gamer', url: 'mangatown.com/manga/the_gamer/', readTo: '118' },
			4: { name: 'UQ Holder!', url: 'mangahere.co/manga/uq_holder/', readTo: '106' },
		};
		// logs for debugging
		console.groupCollapsed( 'Example Manga to be loaded' );
		console.table( compressed );
		console.groupEnd();

		// inflate our compressed example data
		return inflateCompressed( compressed )
			.then( saveChanges ) // save our example
			.then( ( ) => console.log( 'Done loading example', window.data.state ) ) // log for debugging
			.then( getFresh ); // get fresh from the DB for insurance
	}

	return {

		// set the state defaults
		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: {},
		},

		updateUnreadCount, // expose function

		capacityUsed, // expose function

		markRead, // expose function

		getFresh, // expose function
		compressForStorage, // expose function
		inflateCompressed, // expose function
		saveChanges, // expose function
		loadExample, // expose function

	};
}

// Initialize
window.data = initStorage();
