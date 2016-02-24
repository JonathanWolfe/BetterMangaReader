'use strict';

function importOldBmr( bookmark ) {
	if ( !bookmark ) {
		throw new Error( 'Missing bookmark for import' );
	}

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
			// Push our operation into the placeholder
			operations.push( window.parsers.expandMangaInfo( item ) );
		}
	} );

	// When all manga are done being processed,
	// Save the changes,
	// then delete the bookmark so we don't do this again
	return new Promise( ( resolve ) => {
		Promise.all( operations )
			.then( window.parsers.checkForReleases )
			.then( window.data.saveChanges )
			.then( ( ) => {
				chrome.bookmarks.remove( bookmark.id, resolve );
			} );
	} );
}

window.importOldBmr = importOldBmr;
