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
			chrome.storage.sync.getBytesInUse( null, ( bytes ) => resolve( 100 * ( bytes / 1000000 ) ) );
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
		window.data.getByKey( 'url', window.parsers.helpers.normalizeUrl( mangaUrl ) );
	}

	/**
	 * Find a Manga by it's Name
	 * @param  {String} mangaName Name of the manga to find
	 * @return {Manga}            The found Manga object, or undefined
	 */
	function getByName( mangaName ) {
		window.data.getByKey( 'name', mangaName.toLowerCase().trim() );
	}

	/**
	 * Determine if a manga is being tracked
	 * Multiple search terms can be provided as additional arguments
	 * @param  {String}  searchTerm Needle to search for
	 * @return {Boolean}            Whether the manga was found
	 */
	function mangaIsTracked( ...searchTerm ) {
		let found = false;

		searchTerm.forEach( ( term ) => {
			const urlMatched = window.data.getByUrl( term );
			const nameMatched = window.data.getByName( term );

			if ( urlMatched || nameMatched ) {
				found = true;
			}
		} );

		return found;
	}

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
	/**
	 * Mark a manga as having been read to current chapter
	 * @param  {String} uuid UUID of the manga to update
	 * @return {Promise}     Promise of data.saveChanges()
	 */
	function markRead( uuid ) {
		if ( window.data.state.tracking[ uuid ] ) {
			window.data.state.tracking[ uuid ].readTo = window.data.state.tracking[ uuid ].latestChapter;
			return window.data.saveChanges();
		}
		return Promise.resolve( false );
	}

	/**
	 * Update the state with Chrome's synced version
	 * @return {State} A promise resolving with the global state
	 */
	function getFresh() {
		const defaultResponse = {
			editDate: ( new Date() ).toISOString(),
			tracking: {},
		};

		return new Promise( ( resolve, reject ) => {
			chrome.storage.sync.get( null, ( response ) => {
				response = Object.keys( response ).length ? response : defaultResponse;

				window.data.state = response;
				window.data.primeIndexes();

				window.data.updateUnreadCount();

				resolve( response );
			} );
		} );
	}

	/**
	 * Save state changes to Chrome's Sync storage
	 * @return {State} A promise resolving with the global state from Chrome
	 */
	function saveChanges() {
		return new Promise( ( resolve, reject ) => {
			window.data.state.editDate = ( new Date() ).toISOString();
			console.log( 'Saving to Chrome Storage', window.data.state );

			chrome.storage.sync.set( window.data.state, ( ) => window.data.getFresh().then( resolve ) );
		} );
	}

	/**
	 * Load an example set of data
	 * @return {Promise} A promise resolving with nothing and logs upon completion
	 */
	function loadExample() {
		window.data.state = {
			editDate: ( new Date() ).toISOString(),
			tracking: {
				'd9266b7b-8eb5-4b50-9c77-feccc3fe3f6e': {
					name: 'Bleach',
					url: 'mangastream.com/manga/bleach/',
					readTo: '663',
					readToUrl: 'readms.com/r/bleach/663/3237/1/',
					latestChapter: '663',
					latestChapterUrl: 'readms.com/r/bleach/663/3237/1/',
				},
				'0f6a891f-140b-473c-b438-8a388d29e3a6': {
					name: 'Fairy Tail',
					url: 'mangastream.com/manga/fairy_tail/',
					readTo: '473',
					readToUrl: 'readms.com/r/fairy_tail/473/3232/1',
					latestChapter: '474',
					latestChapterUrl: 'readms.com/r/fairy_tail/474/3244/1/',
				},
				'5e7b7a5d-97ef-4007-a187-a8c2b6a79d91': {
					name: 'One Piece',
					url: 'mangatown.com/manga/one_piece/',
					readTo: '12',
					readToUrl: 'mangatown.com/manga/one_piece/v02/c012/',
					latestChapter: '816',
					latestChapterUrl: 'mangatown.com/manga/one_piece/v69/c816/',
				},
				'2c9404c8-341b-49ba-99a2-ef3a002b8bd7': {
					name: 'The Gamer',
					url: 'mangatown.com/manga/the_gamer/',
					readTo: '120',
					readToUrl: 'mangatown.com/manga/the_gamer/c120/',
					latestChapter: '120',
					latestChapterUrl: 'mangatown.com/manga/the_gamer/c120/',
				},
				'3580deb4-bef0-4319-aaf0-edf73492c5c9': {
					name: 'UQ Holder!',
					url: 'mangahere.co/manga/uq_holder/',
					readTo: '106',
					readToUrl: 'mangahere.co/manga/uq_holder/c106/',
					latestChapter: '112',
					latestChapterUrl: 'mangahere.co/manga/uq_holder/c112/',
				},
			},
		};

		return window.data.saveChanges().then( ( ) => console.log( 'Done loading example' ) );
	}

	return {

		state: {},

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

		saveChanges,
		loadExample,

	};
}

window.data = initStorage();
window.data.getFresh();
