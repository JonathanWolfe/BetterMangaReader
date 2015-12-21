// Open or Focus the BMR tab
// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener( function listenForIconClick() {

	const optionsUrl = chrome.extension.getURL( 'html/index.html' );

	chrome.tabs.query( {
		url: optionsUrl,
	}, function openExtensionPage( extensionTab ) {

		if ( extensionTab.length ) {
			chrome.tabs.update( extensionTab[ 0 ].id, {
				selected: true,
			} );
		} else {
			chrome.tabs.create( {
				url: optionsUrl,
			} );
		}
	} );

} );
