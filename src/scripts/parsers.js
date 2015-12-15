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
			const pieces = new window.URL( url ).hostname.split( '.' );
			let parser;
			while ( pieces ) {
				parser = window.parsers[ pieces.shift() ];
				if ( parser ) break;
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
