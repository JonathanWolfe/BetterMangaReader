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

			if ( manga && parseFloat( manga.readTo ) < parseFloat( manga.latestChapter ) ) {
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
				let data = {};

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
				window.parsers.updateAllManga( data )
					.then( window.query.primeIndexes ) // re-prime our query indexes
					.then( updateUnreadCount ) // update the badge icon
					.then( () => resolve( window.data.state ) ); // return the state

			} );
		} );
	}

	/**
	 * Save state changes to Chrome's Sync storage
	 */
	function saveChanges() {
		// use global state if invalid input
		const state = window.data.state;

		// Setup a promise
		return new Promise( ( resolve ) => {
			// clear the storage
			// then resolve the promise
			chrome.storage.sync.clear( () => chrome.storage.sync.set( state, resolve ) );
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
		const example = JSON.parse( '{"0":{"name":"UQ Holder!","url":"mangahere.co/manga/uq_holder/","readTo":"106","readToUrl":"mangahere.co/manga/uq_holder/c106/","nextChapter":"107","nextChapterUrl":"mangahere.co/manga/uq_holder/c107/","latestChapter":"128","latestChapterUrl":"mangahere.co/manga/uq_holder/c128/"},"1":{"name":"The Gamer","url":"mangatown.com/manga/the_gamer/","readTo":"118","readToUrl":"mangatown.com/manga/the_gamer/c118/","nextChapter":"119","nextChapterUrl":"mangatown.com/manga/the_gamer/c119/","latestChapter":"136","latestChapterUrl":"mangatown.com/manga/the_gamer/c136/"},"2":{"name":"Fairy Tail","url":"mangastream.com/manga/fairy_tail/","readTo":"473","readToUrl":"mangastream.com/manga/fairy_tail/","nextChapter":"498","nextChapterUrl":"mangastream.com/r/fairy_tail/498/3623/1/","latestChapter":"498","latestChapterUrl":"mangastream.com/r/fairy_tail/498/3623/1/"},"3":{"name":"Bleach","url":"mangastream.com/manga/bleach/","readTo":"663","readToUrl":"mangastream.com/manga/bleach/","nextChapter":"686","nextChapterUrl":"mangastream.com/r/bleach/686/3613/1/","latestChapter":"686","latestChapterUrl":"mangastream.com/r/bleach/686/3613/1/"},"4":{"name":"Gosu","url":"mangatown.com/manga/gosu/","readTo":"51","readToUrl":"mangatown.com/manga/gosu/c051/","nextChapter":"51","nextChapterUrl":"mangatown.com/manga/gosu/c051/","latestChapter":"51","latestChapterUrl":"mangatown.com/manga/gosu/c051/"},"5":{"name":"Magi - Sinbad no Bouken","url":"mangatown.com/manga/magi_sinbad_no_bouken/","readTo":"115","readToUrl":"mangatown.com/manga/magi_sinbad_no_bouken/c115/","nextChapter":"115","nextChapterUrl":"mangatown.com/manga/magi_sinbad_no_bouken/c115/","latestChapter":"115","latestChapterUrl":"mangatown.com/manga/magi_sinbad_no_bouken/c115/"},"6":{"name":"Tomo-chan wa Onnanoko!","url":"mangatown.com/manga/tomo_chan_wa_onnanoko/","readTo":"394","readToUrl":"mangatown.com/manga/tomo_chan_wa_onnanoko/c394/","nextChapter":"394","nextChapterUrl":"mangatown.com/manga/tomo_chan_wa_onnanoko/c394/","latestChapter":"394","latestChapterUrl":"mangatown.com/manga/tomo_chan_wa_onnanoko/c394/"},"7":{"name":"Dou Po Cang Qiong","url":"mangatown.com/manga/dou_po_cang_qiong/","readTo":"170","readToUrl":"mangatown.com/manga/dou_po_cang_qiong/c170/","nextChapter":"170","nextChapterUrl":"mangatown.com/manga/dou_po_cang_qiong/c170/","latestChapter":"170","latestChapterUrl":"mangatown.com/manga/dou_po_cang_qiong/c170/"},"8":{"name":"Yin Zhi Shoumuren","url":"mangatown.com/manga/yin_zhi_shoumuren/","readTo":"128","readToUrl":"mangatown.com/manga/yin_zhi_shoumuren/c128/","nextChapter":"128","nextChapterUrl":"mangatown.com/manga/yin_zhi_shoumuren/c128/","latestChapter":"128","latestChapterUrl":"mangatown.com/manga/yin_zhi_shoumuren/c128/"}}' );

		// logs for debugging
		console.groupCollapsed( 'Example Manga to be loaded' );
		console.table( example );
		console.groupEnd();

		// Set our example as the manga list
		window.data.state.tracking = example;

		return window.parsers.updateAllManga().then( getFresh ); // get fresh from the DB for insurance
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
		saveChanges, // expose function
		loadExample, // expose function

	};
}

// Initialize
window.data = initStorage();
