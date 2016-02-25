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

chrome.browserAction.setBadgeText( { text: '?' } );
chrome.browserAction.setBadgeBackgroundColor( { color: '#777' } );
chrome.browserAction.setTitle( { title: `Initializing BMR` } );

// Load any data that may exist
window.data.getFresh().then( ( ) => {
	chrome.browserAction.setBadgeBackgroundColor( { color: '#f00' } );
	window.checkInterval = window.setInterval( window.parsers.updateAllManga, 10 * 60 * 1000 );
} );
