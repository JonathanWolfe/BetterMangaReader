chrome.runtime.onMessage.addListener( function ( request, sender, sendResponse ) {

	console.log( 'request recieved', request );

	let thisManga;

	if ( request.isMangaTracked ) {
		sendResponse( window.bmr_storage.already_tracked( request.isMangaTracked ) );
	}

	if ( request.updateMangaReadChapter ) {
		thisManga = window.bmr_storage.state[ request.updateMangaReadChapter.id ];

		thisManga.latestRead = request.updateMangaReadChapter.info.currentChapter;
		thisManga.urlOfLatestRead = request.updateMangaReadChapter.info.currentChapterURL;

		sendResponse( 'updated read chapter' );
	}

	if ( request.markMangaAsRead ) {
		thisManga = window.bmr_storage.state[ window.bmr_storage.already_tracked( request.markMangaAsRead )[ 1 ] ];

		thisManga.latestRead = thisManga.latest;
		thisManga.urlOfLatestRead = thisManga.chapter_list[ 0 ][ 2 ];

		sendResponse( 'Manga marked as read' );
	}

	if ( request.resetMangaReading ) {
		thisManga = window.bmr_storage.state[ window.bmr_storage.already_tracked( request.resetMangaReading )[ 1 ] ];

		thisManga.latestRead = '0';
		thisManga.urlOfLatestRead = thisManga.url;

		sendResponse( 'Manga marked as read' );
	}

	if ( request.mangaToTrack ) {

		console.log( 'attempting to save new manga' );

		const newManga = request.mangaToTrack;
		const isTracked = window.bmr_storage.already_tracked( newManga.name );

		console.log( isTracked );

		if ( !isTracked[ 1 ] ) {
			newManga.id = window.bmr_storage.state.length;
			window.bmr_storage.state.push( newManga );

			console.log( 'item not found' );

		} else {
			window.bmr_storage.state[ isTracked[ 1 ] ].isTracked = true;
			console.log( 'item found', window.bmr_storage.state[ isTracked[ 1 ] ] );
		}

		sendResponse( 'Now Tracking Manga' );

	}

	if ( request.mangaToStopTracking ) {

		console.log( 'attempting to stop tracking manga' );

		const found = window.bmr_storage.already_tracked( request.mangaToStopTracking );

		if ( found[ 0 ] === true ) {
			window.bmr_storage.state[ found[ 1 ] ].isTracked = false;
		}

		sendResponse( 'Have Stopped Tracking' );
	}

	if ( request.deleteManga ) {
		window.bmr_storage.state.splice(
			window.bmr_storage.already_tracked( request.deleteManga )[ 1 ], 1
		);

		sendResponse( 'Deleted Manga' );
	}

	window.bmr_storage.update_icon_number();

} );
