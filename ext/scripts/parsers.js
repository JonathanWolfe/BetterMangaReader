'use strict';

window.parsers = {
	/**
	 * Add a parser to the Collection
	 * @param {Parser} parser The parser object to be added
	 */
	register: ( parser ) => {
		if ( !window.parsers[ parser.normalizedName ] ) {
			window.parsers[ parser.normalizedName ] = parser;
		}
	},

	/**
	 * Find a parser via a URL
	 * @param  {String} url URL to search with
	 * @return {Parser}     A Parser Object
	 */
	findByUrl: ( url ) => {
		url = window.parsers.helpers.validUrl( url );

		const normalizedUrl = new window.URL( url ).hostname;
		const parsers = Object.keys( window.parsers );

		let parser;

		while ( parsers.length ) {
			const trying = window.parsers[ parsers.pop() ];
			if ( trying.urls ) {
				const normal = trying.urls.indexOf( normalizedUrl );
				const noWWW = trying.urls.indexOf( normalizedUrl.replace( 'www.', '' ) );

				if ( normal !== -1 || noWWW !== -1 ) {
					parser = trying;
					break;
				}
			}
		}

		return parser || false;
	},

	expandMangaInfo: ( manga ) => {
		// Get the parser for this manga
		const parser = window.parsers.findByUrl( manga.url );

		if ( !parser ) {
			throw new Error( "Can't find parser for: ", manga );
		}

		// Make URL valid if it's not
		const validUrl = window.parsers.helpers.validUrl( manga.url );
		// Get the HTML of the Manga's Profile page
		return window.parsers.helpers.getHtmlFromUrl( validUrl ).then( ( parsedHTML ) => {

			// Get the chapters of the manga
			const chaptersListFromProfile = parser.getChaptersListFromProfile( parsedHTML );
			// Sort it to make sure it's in the order we want
			const chapters = chaptersListFromProfile.sort(
				( a, b ) => parseFloat( b.number ) - parseFloat( a.number )
			);

			// Latest Chapter is the first chapter in the sorted list
			const latestChapter = chapters[ 0 ];
			// Placeholders
			let currentChapter;
			let nextChapter;
			const currentRead = manga.readTo || manga.latestRead;

			// Loop over all the chapters looking for the latest read
			for ( let i = 0; i < chapters.length; i += 1 ) {
				const chapter = chapters[ i ];
				// Found the latest read chapter
				if ( parseFloat( chapter.number ) === parseFloat( currentRead ) ) {
					// Next chapter is the previous one in the list,
					// or the latest chapter if doesn't exist
					currentChapter = chapters[ i ];
					nextChapter = chapters[ i - 1 ] || chapters[ 0 ];

					// Stop Looping, we got what we wanted
					break;
				}
			}

			// Didn't find the chapter in the list? Set it to the latest chapter
			if ( !nextChapter ) {
				nextChapter = latestChapter;
			}

			// Build our tracking object
			const forTracking = {
				name: manga.name,
				url: window.parsers.helpers.normalizeUrl( manga.url ),

				readTo: currentRead.toString(),
				readToUrl: window.parsers.helpers.normalizeUrl( currentChapter.url ),

				nextChapter: nextChapter.number.toString(),
				nextChapterUrl: window.parsers.helpers.normalizeUrl( nextChapter.url ),

				latestChapter: latestChapter.number.toString(),
				latestChapterUrl: window.parsers.helpers.normalizeUrl( latestChapter.url ),
			};

			// Generate a UUID and add it to the state
			return forTracking;
		} );
	},

	checkMangaForRelease: ( manga ) => {
		const parser = window.parsers.findByUrl( manga.url );

		if ( !parser ) {
			console.error( 'Failed to find parser for: ', manga );
			return false;
		}

		return window.parsers.helpers.getHtmlFromUrl( window.parsers.helpers.validUrl( manga.url ) )
			.then( parser.getChaptersListFromProfile )
			.then( ( chapters ) => window.parsers.expandMangaInfo( manga, chapters ) );
	},

	checkForReleases: ( compressed ) => {
		console.log( 'Checking for Releases' );
		if ( compressed ) {
			console.log( 'Got compressed data' );

			const promises = compressed.map( ( manga ) => window.parsers.checkMangaForRelease( manga ) );

			return Promise.all( promises )
				.then( ( mangas ) => {
					const uncompressed = {
						editDate: ( new Date() ).toISOString(),
						tracking: {},
					};

					mangas.forEach( ( manga ) => {
						uncompressed.tracking[ window.uuid.v4() ] = manga;
					} );

					window.data.state = uncompressed;
				} )
				.then( window.data.saveChanges );
		} else {
			console.log( 'Got expanded data' );

			const uuids = Object.keys( window.data.state.tracking );
			const promises = uuids.map( ( uuid ) => {
				const manga = window.data.state.tracking[ uuid ];
				return window.parsers.checkMangaForRelease( manga );
			} );

			return Promise.all( promises )
				.then( ( mangas ) => {
					mangas.forEach( ( manga ) => {
						const uuid = window.data.getByUrl( manga.url );
						window.data.state.tracking[ uuid ] = manga;
					} );
				} )
				.then( window.data.saveChanges ).then( ( ) => window.data.state );
		}
	},

	helpers: {
		/**
		 * Adds missing parts of a url
		 * @param  {String} url	Url to ensure is useable
		 * @return {String}       Useable url
		 */
		validUrl: ( url ) => {
			const hasHTTP = url.includes( 'http://' ) || url.includes( 'https://' );
			return hasHTTP ? url : `http://${url}`;
		},

		/**
		 * Normalize a URL for storage
		 * No http, www, and include closing slash
		 * @param  {String} url Url to normalize
		 * @return {String}     Normalized URL
		 */
		normalizeUrl: ( url ) => {
			let normalized = url.toLowerCase().trim();

			normalized = normalized.replace( 'http://', '' ).replace( 'https://', '' );
			normalized = normalized.replace( 'www.', '' );

			if ( normalized.substr( -1 ) !== '/' ) {
				normalized += '/';
			}

			return normalized;
		},

		/**
		 * Retrieves the HTML of a URL
		 * @param  {String} url URL to scrape
		 * @return {Promise}     Resolves with the HTML
		 */
		getHtmlFromUrl: ( url ) => fetch( url ).then(
			( response ) => response.text().then(
				( HTML ) => $( '<html />' ).append( HTML ).bmrLiteSanitize()
			)
		),
	},
};
