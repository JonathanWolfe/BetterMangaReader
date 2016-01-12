window.eventHandlers = {

	parserForUrl: ( message, sender ) => window.parsers.findByUrl( sender.url ),

	parseHTML: ( message, sender ) => {
		const parser = window.parsers.findByUrl( sender.url );
		const parsedHTML = $( '<html />' ).append( message.html );

		const isChapterPage = parser.isChapterPage( parsedHTML );
		const isProfilePage = parser.isProfilePage( parsedHTML );

		return {
			isChapterPage,
			isProfilePage,
		};
	},

	parseChapterPage: ( message, sender, parser, parsedHTML ) => {
		if ( !parser || !parsedHTML ) {
			parser = window.parsers.findByUrl( sender.url );
			parsedHTML = $( '<html />' ).append( message.html );
		}

		const chapterInfo = parser.getChapterInfo( parsedHTML );
		const chapterListFromChapter = parser.getChaptersListFromChapter( parsedHTML );
		const imageFromPage = parser.getImageFromPage( parsedHTML );
		const isTracked = window.data.mangaIsTracked( chapterInfo.mangaUrl, chapterInfo.name );
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

		const pagePromises = [];

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
		const urlMatched = window.data.getByUrl( message.manga.mangaUrl );
		const nameMatched = window.data.getByName( message.manga.name );

		const found = urlMatched || nameMatched || false;

		if ( found ) {
			delete window.data.state.tracking[ found ];
		} else {
			window.data.state.tracking[ window.uuid.v4() ] = {
				name: message.manga.name,
				url: message.manga.mangaUrl,
				readTo: message.manga.number,
				latestChapter: '9999',
			};
		}

		window.data.saveChanges().then( ( state ) => {
			chrome.tabs.sendMessage( sender.tab.id, {
				type: 'success',
				action: 'toggleTrackingButton',
				value: window.data.mangaIsTracked( message.manga.mangaUrl, message.manga.name ),
			} );
		} );
	},

};

chrome.runtime.onMessage.addListener( function processMessage( message, sender, sendResponse ) {

	console.group( 'message recieved - ' + message.action );
	console.log( 'message', message );
	console.log( 'sender', sender );
	console.groupEnd();

	if ( window.eventHandlers[ message.action ] ) {

		if ( typeof window.eventHandlers[ message.action ] === 'function' ) {
			sendResponse( {
				type: 'success',
				value: window.eventHandlers[ message.action ].call( this, message, sender ),
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
