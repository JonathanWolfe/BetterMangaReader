'use strict';

// Open or Focus the BMR tab
// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener( ( ) => {

	const optionsUrl = chrome.extension.getURL( 'html/index.html' );

	chrome.tabs.query( { url: optionsUrl }, ( extensionTab ) => {
		if ( extensionTab.length ) {
			chrome.tabs.update( extensionTab[ 0 ].id, { selected: true } );
		} else {
			chrome.tabs.create( { url: optionsUrl } );
		}
	} );

} );

window.data.getFresh().then( ( state ) => {
	chrome.bookmarks.search( 'BMR Backup', ( results ) => {

		console.log( 'bookmark', results );

		if ( results.length ) {
			const raw = results[ 0 ].url.slice( 23, -2 );
			const parsed = JSON.parse( raw );
			console.log( 'parsed', parsed );

			const operations = [ ];

			parsed.forEach( ( item ) => {
				const parser = window.parsers.findByUrl( item.url );

				item.latestRead = Array.isArray( item.latestRead ) ? item.latestRead[ 1 ] : item.latestRead;
				item.latest = Array.isArray( item.latest ) ? item.latest[ 1 ] : item.latest;

				if ( parser && item.isTracked ) {
					const validUrl = window.parsers.helpers.validUrl( item.url );
					const operation = window.parsers.helpers.getHtmlFromUrl( validUrl ).then( ( parsedHTML ) => {

						const chaptersListFromProfile = parser.getChaptersListFromProfile( parsedHTML );
						const chapters = chaptersListFromProfile.sort(
							( a, b ) => parseFloat( b.number ) - parseFloat( a.number )
						);
						const latestChapter = chapters[ 0 ];
						let nextChapter;

						for ( let i = 0; i < chapters.length; i += 1 ) {
							const chapter = chapters[ i ];
							if ( parseFloat( chapter.number ) === parseFloat( item.latestRead[ 1 ] ) ) {
								nextChapter = chapters[ i - 1 ] || chapters[ 0 ];
								break;
							}
						}

						if ( !nextChapter ) {
							nextChapter = latestChapter;
						}

						const forTracking = {
							name: item.name,
							url: window.parsers.helpers.normalizeUrl( item.url ),

							readTo: parseFloat( item.latestRead ).toString(),
							readToUrl: window.parsers.helpers.normalizeUrl( item.urlOfLatestRead ),

							nextChapter: nextChapter.number.toString(),
							nextChapterUrl: window.parsers.helpers.normalizeUrl( nextChapter.url ),

							latestChapter: latestChapter.number.toString(),
							latestChapterUrl: window.parsers.helpers.normalizeUrl( latestChapter.url ),
						};

						console.log( item.name, forTracking );

						window.data.state.tracking[ window.uuid.v4() ] = forTracking;
					} );

					operations.push( operation );
				}
			} );

			Promise.all( operations ).then( window.data.saveChanges ).then( ( ) => {
				chrome.bookmarks.remove( results[ 0 ].id, ( ) => console.log( 'Deleted Bookmark' ) );
			} );
		} else if ( !Object.keys( state.tracking ).length ) {
			window.data.loadExample();

		} else {
			console.log( 'Initial State', state );
		}

	} );
} );
