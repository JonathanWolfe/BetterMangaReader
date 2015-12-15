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

		const scanContainer = parser.scanContainer();
		const chapterInfo = parser.getChapterInfo( parsedHTML );
		const pages = parser.getPages( parsedHTML );
		const imageFromPage = parser.getImageFromPage( parsedHTML );
		const chapterListFromChapter = parser.getChaptersListFromChapter( parsedHTML );

		return {
			scanContainer,
			chapterInfo,
			pages,
			imageFromPage,
			chapterListFromChapter,
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

};
