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

		helpers: {
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
