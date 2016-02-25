'use strict';

function initStorage() {
	/**
	 * Prime the indexes for use
	 * @return {Object} The finalized indexes
	 */
	function primeIndexes() {
		window.data.indexes.name = { };
		window.data.indexes.url = { };

		Object.keys( window.data.state.tracking ).forEach( ( uuid ) => {
			const current = window.data.state.tracking[ uuid ];

			window.data.indexes.name[ current.name.toLowerCase().trim() ] = uuid;
			window.data.indexes.url[ window.parsers.helpers.normalizeUrl( current.url ) ] = uuid;
		} );

		return window.data.indexes;
	}

	/**
	 * Determine how much of our Chrome Sync capactiy is used
	 * @return {Number} Percentage of capactiy used
	 */
	function capacityUsed() {
		return new Promise( ( resolve ) => {
			chrome.storage.sync.getBytesInUse( null, ( bytes ) => {
				const megaBytes = bytes / 1000000;
				const percentFull = megaBytes * 100;

				resolve( percentFull.toFixed( 2 ) );
			} );
		} );
	}

	/**
	 * Grab a manga from our tracked ones
	 * @param  {String} uuid UUID of the manga to find
	 * @return {Manga}       The found Manga object, or undefined
	 */
	function fetch( uuid ) {
		return window.data.state.tracking[ uuid ];
	}

	/**
	 * Find a Manga by the value of the provided key
	 * @param  {String} key         Field to search in
	 * @param  {String} searchValue Needle trying to find
	 * @return {Manga}              The found Manga object, or undefined
	 */
	function getByKey( key, searchValue ) {
		if ( typeof window.data.indexes[ key ] === 'undefined' ) {
			throw new Error( `Invalid Query Key: ${key}` );
		}
		return window.data.indexes[ key ][ searchValue ];
	}

	/**
	 * Find a Manga by it's URL
	 * @param  {String} mangaUrl URL of the manga to find
	 * @return {Manga}           the found Manga object, or undefined
	 */
	function getByUrl( mangaUrl ) {
		return getByKey( 'url', window.parsers.helpers.normalizeUrl( mangaUrl ) );
	}

	/**
	 * Find a Manga by it's Name
	 * @param  {String} mangaName Name of the manga to find
	 * @return {Manga}            The found Manga object, or undefined
	 */
	function getByName( mangaName ) {
		return getByKey( 'name', mangaName.toLowerCase().trim() );
	}

	/**
	 * Determine if a manga is being tracked
	 * Multiple search terms can be provided as additional arguments
	 * @param  {String}  searchTerm Needle to search for
	 * @return {Boolean}            Whether the manga was found
	 */
	function mangaIsTracked( ...searchTerm ) {
		let found = false;

		for ( let i = 0; i < searchTerm.length; i += 1 ) {
			const term = searchTerm[ i ];
			const urlMatched = getByUrl( term );
			const nameMatched = getByName( term );

			if ( urlMatched || nameMatched ) {
				console.log( 'found' );
				found = true;
				break;
			}
		}

		return found;
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
	 * @param  {Array} compressed Array of compressed manga objects
	 * @return {Object}           Returns a state object
	 */
	function createMockState( compressed ) {
		const promises = compressed.map( ( manga ) => window.parsers.updateMangaInfo( manga ) );

		return Promise.all( promises )
			.then( ( mangas ) => {
				const mockState = {
					editDate: ( new Date() ).toISOString(),
					tracking: {},
				};

				mangas.forEach( ( manga ) => {
					mockState.tracking[ window.uuid.v4() ] = manga;
				} );

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

				createMockState( response.compressed )
					.then( ( mockState ) => {
						window.data.state = mockState;
						return window.data.state;
					} )
					.then( primeIndexes )
					.then( updateUnreadCount )
					.then( ( ) => resolve( window.data.state ) );

			} );
		} );
	}

	/**
	 * Compress the full sized state down to it's smallest form
	 * because Chrome hates people
	 * @param  {Array|Object} expanded A state object or an array of full sized manga tracking objects
	 * @return {Array}                 Array of the most compressed the manga data can be
	 */
	function compressForStorage( expanded ) {
		let data;

		if ( !expanded.tracking ) {
			data = window.data.state;
		}

		const uuids = Object.keys( data.tracking );
		data = uuids.map( ( uuid ) => data.tracking[ uuid ] );

		console.log( 'In case of error: ', data );

		const compressed = data.map( ( item ) => {
			const shortened = {
				name: item.name,
				url: item.url,
				readTo: item.readTo,
			};

			return shortened;
		} );

		console.groupCollapsed( 'Compressed Manga Data' );
		console.table( compressed );
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

			console.log( 'Saving to Chrome Storage', { compressed } );

			chrome.storage.sync.set( { compressed }, resolve );
		} )
			.then( primeIndexes )
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
		const compressed = [
			{ name: 'Bleach', url: 'mangastream.com/manga/bleach/', readTo: '663' },
			{ name: 'Fairy Tail', url: 'mangastream.com/manga/fairy_tail/', readTo: '473' },
			{ name: 'One Piece', url: 'mangatown.com/manga/one_piece/', readTo: '12' },
			{ name: 'The Gamer', url: 'mangatown.com/manga/the_gamer/', readTo: '118' },
			{ name: 'UQ Holder!', url: 'mangahere.co/manga/uq_holder/', readTo: '106' },
		];

		console.groupCollapsed( 'Example Manga to be loaded' );
		console.table( compressed );
		console.groupEnd();

		return createMockState( compressed )
			.then( saveChanges )
			.then( ( ) => console.log( 'Done loading example', window.data.state ) )
			.then( getFresh );
	}

	return {

		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: {},
		},

		indexes: {
			name: {},
			url: {},
		},
		primeIndexes,

		updateUnreadCount,

		capacityUsed,

		fetch,
		markRead,

		getFresh,

		getByUrl,
		getByName,
		getByKey,

		mangaIsTracked,

		compressForStorage,
		saveChanges,
		loadExample,

	};
}

window.data = initStorage();
// chrome.storage.sync.clear( ( ) => {
// 	window.data.loadExample()
// 		.then( ( ) => chrome.browserAction.setBadgeBackgroundColor( { color: '#f00' } ) );
// } );
