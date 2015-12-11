// window.bmr_storage.loadExample();
window.bmr_storage.loadState();

( function backgroundInit() {

	console.log( "Storage state", window.bmr_storage.state );

	if ( window.bmr_storage.state.length ) {

		var backup_interval = window.setInterval( window.bmr_storage.backup, 60000 ); // every min

		window.bmr_storage.update_icon_number();

		window.setTimeout( window.bmr_storage.expandMangaData, 60000 );
		var expandedDelay = window.setInterval( window.bmr_storage.expandMangaData, 600000 );

	} else {

		console.log( 'No manga yet. Will try again.' );
		var retry = window.setTimeout( backgroundInit, 200 );

	}
} )();


// Open or Focus the BMR tab
// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener( function () {

	var optionsUrl = chrome.extension.getURL( 'src/pages/index.html' );

	chrome.tabs.query( {
		url: optionsUrl
	}, function ( extensionTab ) {

		if ( extensionTab.length ) {
			chrome.tabs.update( extensionTabs[ i ].id, {
				"selected": true
			} );
		} else {
			chrome.tabs.create( {
				url: optionsUrl
			} );
		}
	} );

} );
