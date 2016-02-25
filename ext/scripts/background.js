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
window.data.getFresh().then( checkForNew );
