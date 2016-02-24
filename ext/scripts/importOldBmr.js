'use strict';

function importOldBmr( bookmark ) {
	// Parse the old data
	const raw = bookmark.url.slice( 23, -2 );
	const parsed = JSON.parse( raw );

	// Placeholder for our async operations
	const operations = [ ];

	// Loop over the previously tracked manga
	parsed.forEach( ( item ) => {
		// Get the parser for this manga
		const parser = window.parsers.findByUrl( item.url );

		// Do some normalizing
		item.latestRead = Array.isArray( item.latestRead ) ? item.latestRead[ 1 ] : item.latestRead;
		item.latest = Array.isArray( item.latest ) ? item.latest[ 1 ] : item.latest;

		// Continue if we have a Parser and the manga was tracked
		if ( parser && item.isTracked ) {
			// Make URL valid if it's not
			const validUrl = window.parsers.helpers.validUrl( item.url );
			// Get the HTML of the Manga's Profile page
			const operation = window.parsers.helpers.getHtmlFromUrl( validUrl ).then( ( parsedHTML ) => {

				// Get the chapters of the manga
				const chaptersListFromProfile = parser.getChaptersListFromProfile( parsedHTML );
				// Sort it to make sure it's in the order we want
				const chapters = chaptersListFromProfile.sort(
					( a, b ) => parseFloat( b.number ) - parseFloat( a.number )
				);

				// Latest Chapter is the first chapter in the sorted list
				const latestChapter = chapters[ 0 ];
				// Placeholder
				let nextChapter;

				// Loop over all the chapters looking for the latest read
				for ( let i = 0; i < chapters.length; i += 1 ) {
					const chapter = chapters[ i ];
					// Found the latest read chapter
					if ( parseFloat( chapter.number ) === parseFloat( item.latestRead[ 1 ] ) ) {
						// Next chapter is the previous one in the list,
						// or the latest chapter if doesn't exist
						nextChapter = chapters[ i - 1 ] || chapters[ 0 ];

						// Stop Looping, we got what we wanted
						break;
					}
				}

				// Didn't find the chapter in the list? Set it to the latest chapter
				if ( !nextChapter ) {
					nextChapter = latestChapter;
				}

				// Build our tracking object
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

				// Generate a UUID and add it to the state
				window.data.state.tracking[ window.uuid.v4() ] = forTracking;
			} );

			// Push our operation into the placeholder
			operations.push( operation );
		}
	} );

	// When all manga are done being processed,
	// Save the changes,
	// then delete the bookmark so we don't do this again
	return new Promise( ( resolve ) => {
		Promise.all( operations ).then( window.data.saveChanges ).then( ( ) => {
			chrome.bookmarks.remove( bookmark.id, resolve );
		} );
	} );
}

window.importOldBmr = importOldBmr;
