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
	window.checkInterval = window.setInterval( window.parsers.checkForReleases, 10 * 60 * 1000 );
}

// Load any data that may exist
window.data.getFresh().then( ( ) => {
	// Check if they have an old version of BMR
	chrome.bookmarks.search( 'BMR Backup', ( results ) => {

		// Any old version found?
		if ( results.length ) {
			return window.importOldBmr( results[ 0 ] ).then( checkForNew );
		}

		if ( !results.length &&
				window.data.state.tracking &&
				!Object.keys( window.data.state.tracking ) ) {
			return window.data.loadExample().then( checkForNew );
		}

		return checkForNew();
	} );
} );
