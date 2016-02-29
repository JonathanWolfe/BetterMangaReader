'use strict';

const eventHandlers = {

	parserForUrl: ( message, sender ) => window.parsers.findByUrl( sender.url ),

	parseHTML: ( message, sender ) => {
		const parser = window.parsers.findByUrl( sender.url );
		const parsedHTML = $( '<html />' ).append( message.html );

		const isChapterPage = parser.isChapterPage( parsedHTML );
		const isProfilePage = parser.isProfilePage( parsedHTML );

		return { isChapterPage, isProfilePage };
	},

	parseChapterPage: ( message, sender, parser, parsedHTML ) => {
		if ( !parser || !parsedHTML ) {
			parser = window.parsers.findByUrl( sender.url );
			parsedHTML = $( '<html />' ).append( message.html );
		}

		const chapterInfo = parser.getChapterInfo( parsedHTML );
		const chapterListFromChapter = parser.getChaptersListFromChapter( parsedHTML );
		const imageFromPage = parser.getImageFromPage( parsedHTML );
		const isTracked = window.query.mangaIsTracked( chapterInfo.mangaUrl, chapterInfo.name );
		const pages = parser.getPages( parsedHTML );
		const scanContainer = parser.scanContainer();

		return {
			chapterInfo,
			chapterListFromChapter,
			imageFromPage,
			isTracked,
			pages,
			scanContainer,
		};
	},

	getImagesForChapter: ( message, sender, parser, pages ) => {
		if ( !parser || !pages ) {
			parser = window.parsers.findByUrl( sender.url );
			const parsedHTML = $( '<html />' ).append( message.html );
			pages = parser.getPages( parsedHTML );
		}

		const pagePromises = [ ];

		for ( let i = 0; i < pages.length; i += 1 ) {
			pagePromises.push(
				window.parsers.helpers.getHtmlFromUrl( pages[ i ] )
					.then( parser.getImageFromPage )
			);
		}

		Promise.all( pagePromises ).then( ( imagesArray ) => {
			chrome.tabs.sendMessage( sender.tab.id, {
				type: 'success',
				action: 'putImagesForChapter',
				value: imagesArray,
			} );
		} );
	},

	getChapterListFromProfile: ( message, sender, parser, parsedHTML ) => {
		if ( !parser || !parsedHTML ) {
			parser = window.parsers.findByUrl( sender.url );
			parsedHTML = $( '<html />' ).append( message.html );
		}

		const chapterListFromProfile = parser.getChaptersListFromProfile( parsedHTML );

		return chapterListFromProfile;
	},

	toggleTracking: ( message, sender ) => {
		const urlMatched = window.query.getByUrl( message.manga.url );
		const nameMatched = window.query.getByName( message.manga.name );

		const found = urlMatched || nameMatched || false;

		let manga = message.manga;

		if ( found ) {
			manga = window.data.state.tracking[ found ];
			delete window.data.state.tracking[ found ];
		} else {
			manga = window.parsers.helpers.normalizeAllFields( message.manga );
			window.data.state.tracking[ window.uuid.v4() ] = manga;
		}

		window.data.saveChanges().then( ( state ) => {
			chrome.tabs.sendMessage( sender.tab.id, {
				type: 'success',
				action: 'toggleTrackingButton',
				value: window.query.mangaIsTracked( manga.url, manga.name ),
			} );
		} );
	},

	setReadChapter: ( message, sender ) => {
		const manga = window.parsers.helpers.normalizeAllFields( message.manga );
		const uuid = window.query.getByUrl( manga.url );
		window.data.state.tracking[ uuid ] = manga;

		return window.data.saveChanges();
	},

};

function processMessage( message, sender, sendResponse ) {

	console.groupCollapsed( `message recieved - ${message.action}` );
	console.log( 'message', message );
	console.log( 'sender', sender );
	console.groupEnd();

	if ( eventHandlers[ message.action ] ) {

		if ( typeof eventHandlers[ message.action ] === 'function' ) {
			sendResponse( {
				type: 'success',
				value: eventHandlers[ message.action ].call( null, message, sender ),
			} );
		} else {
			sendResponse( {
				type: 'success',
				value: eventHandlers[ message.action ],
			} );
		}

	} else {
		sendResponse( {
			type: 'error',
			value: `No event handler for the action "${message.action}"`,
		} );
	}
}

// initialize
chrome.runtime.onMessage.addListener( processMessage );
