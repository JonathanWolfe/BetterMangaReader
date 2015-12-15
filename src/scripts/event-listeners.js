chrome.runtime.onMessage.addListener( function processMessage( message, sender, sendResponse ) {

	console.group( 'message recieved - ' + message.action );
	console.log( 'message', message );
	console.log( 'sender', sender );
	console.groupEnd();

	if ( window.eventHandlers[ message.action ] ) {

		if ( typeof window.eventHandlers[ message.action ] === 'function' ) {
			sendResponse( {
				type: 'success',
				value: window.eventHandlers[ message.action ].call( this, message, sender, sendResponse ),
			} );
		} else {
			sendResponse( {
				type: 'success',
				value: window.eventHandlers[ message.action ],
			} );
		}

	} else {
		sendResponse( {
			type: 'error',
			value: 'No event handler for the action "' + message.action + '"',
		} );
	}

} );
