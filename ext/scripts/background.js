'use strict';

// Open or Focus the BMR tab
// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener( ( ) => {

	// Get what the url for the extension page will be
	const optionsUrl = chrome.extension.getURL( 'html/index.html' );

	// Search for that url
	chrome.tabs.query( { url: optionsUrl }, ( extensionTab ) => {
		// Found it?
		if ( extensionTab.length ) {
			// Swap to it
			chrome.tabs.update( extensionTab[ 0 ].id, { selected: true } );
		} else {
			// Open it
			chrome.tabs.create( { url: optionsUrl } );
		}
	} );

} );

function checkForNew() {
	return new Promise( ( resolve ) => {
		// Check for new releases every 10 minutes
		window.parsers.checkForReleases().then(
			( ) => window.setInterval( window.parsers.checkForReleases, 10 * 60 * 1000 )
		).then( resolve );
	} );
}

// Load any data that may exist
window.data.getFresh().then( ( state ) => {
	// Check if they have an old version of BMR
	chrome.bookmarks.search( 'BMR Backup', ( results ) => {

		// Any old version found?
		if ( results.length ) {
			return window.importOldBmr( results[ 0 ] ).then( checkForNew );
		}

		// Load the example manga if they didn't have any old BMR data
		if ( !results.length && !Object.keys( state.tracking ).length ) {
			return window.data.loadExample().then( checkForNew );
		}

		return checkForNew();
	} );
} );
