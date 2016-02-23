'use strict';

window.parsers = ( function initParsers() {
	return {
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

		checkForReleases: ( ) => {
			const uuids = Object.keys( window.data.state.tracking );
			const promises = [ ];

			for ( let i = uuids.length - 1; i >= 0; i -= 1 ) {

				const uuid = uuids[ i ];
				const manga = window.data.state.tracking[ uuid ];
				const parser = window.parsers.findByUrl( manga.url );

				if ( !parser ) {
					console.log( 'Failed to find parser for: ', manga );
					return false;
				}

				const checking = window.parsers.helpers.getHtmlFromUrl( window.parsers.helpers.validUrl( manga.url ) )
					.then( parser.getChaptersListFromProfile )
					.then( ( chapters ) => {
						chapters = chapters.sort( ( a, b ) => parseFloat( b.number ) - parseFloat( a.number ) );
						manga.latestChapter = chapters[ 0 ].number.toString();
						manga.latestChapterUrl = window.parsers.helpers.normalizeUrl( chapters[ 0 ].url );
						return manga;
					} );

				promises.push( checking );
			}

			return Promise.all( promises ).then( window.data.saveChanges );
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
}() );
