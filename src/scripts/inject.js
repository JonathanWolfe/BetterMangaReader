$( document ).ready( function initBMRInject() {
	let clonedHTML = $( 'body' ).clone();
	clonedHTML.bmrLiteSanitize();
	clonedHTML = clonedHTML.html();

	let chapterInfo;

	const events = {
		getImagesForChapter: () => {
			chrome.runtime.sendMessage( {
				action: 'getImagesForChapter',
				html: clonedHTML,
			} );
		},

		putImagesForChapter: ( images ) => {
			const scanContainer = $( chapterInfo.scanContainer );
			scanContainer.empty();

			for ( let i = 0; i < chapterInfo.pages.length; i += 1 ) {
				scanContainer.append( '<img src="' + images[ i ] + '" />' );
			}
		},

		parseChapterPage: () => {
			chrome.runtime.sendMessage( {
				action: 'parseChapterPage',
				html: clonedHTML,
			}, ( response ) => {
				console.log( 'parseChapterPage', response );
				if ( response && response.type === 'success' ) {
					chapterInfo = response.value;
					events.getImagesForChapter();
				}
			} );
		},

	};

	chrome.runtime.onMessage.addListener( function processMessage( message, sender ) {
		console.group( 'message recieved - ' + message.action );
		console.log( 'message', message );
		console.log( 'sender', sender );
		console.groupEnd();

		if ( typeof events[ message.action ] === 'function' ) {
			events[ message.action ].call( this, message.value );
		}
	} );

	chrome.runtime.sendMessage( {
		action: 'parseHTML',
		html: clonedHTML,
	}, ( response ) => {
		if ( !response ) console.error( 'Chrome Extension Error: ', chrome.runtime.lastError );

		console.log( 'parseHTML', response );
		if ( response.type === 'success' ) {
			if ( response.value.isChapterPage ) {
				events.parseChapterPage();
			}
		} else {
			console.error( 'BMR Error: ', response.value );
		}
	} );
} );
