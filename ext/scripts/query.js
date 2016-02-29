'use strict';

function initQuery() {
	/**
	 * Prime the indexes for use
	 * @return {Object} The finalized indexes
	 */
	function primeIndexes() {
		window.query.indexes.name = { };
		window.query.indexes.url = { };

		Object.keys( window.data.state.tracking ).forEach( ( uuid ) => {
			const current = window.data.state.tracking[ uuid ];

			window.query.indexes.name[ current.name.toLowerCase().trim() ] = uuid;
			window.query.indexes.url[ window.parsers.helpers.normalizeUrl( current.url ) ] = uuid;
		} );

		return window.query.indexes;
	}

	/**
	 * Grab a manga from our tracked ones
	 * @param  {String} uuid UUID of the manga to find
	 * @return {Manga}       The found Manga object, or undefined
	 */
	function fetch( uuid ) {
		return window.data.state.tracking[ uuid ];
	}

	/**
	 * Find a Manga by the value of the provided key
	 * @param  {String} key         Field to search in
	 * @param  {String} searchValue Needle trying to find
	 * @return {Manga}              The found Manga object, or undefined
	 */
	function getByKey( key, searchValue ) {
		if ( typeof window.query.indexes[ key ] === 'undefined' ) {
			throw new Error( `Invalid Query Key: ${key}` );
		}
		return window.query.indexes[ key ][ searchValue ];
	}

	/**
	 * Find a Manga by it's URL
	 * @param  {String} mangaUrl URL of the manga to find
	 * @return {Manga}           the found Manga object, or undefined
	 */
	function getByUrl( mangaUrl ) {
		return getByKey( 'url', window.parsers.helpers.normalizeUrl( mangaUrl ) );
	}

	/**
	 * Find a Manga by it's Name
	 * @param  {String} mangaName Name of the manga to find
	 * @return {Manga}            The found Manga object, or undefined
	 */
	function getByName( mangaName ) {
		return getByKey( 'name', mangaName.toLowerCase().trim() );
	}

	/**
	 * Determine if a manga is being tracked
	 * Multiple search terms can be provided as additional arguments
	 * @param  {String}  searchTerm Needle to search for
	 * @return {Boolean}            Whether the manga was found
	 */
	function mangaIsTracked( ...searchTerm ) {
		let found = false;

		for ( let i = 0; i < searchTerm.length; i += 1 ) {
			const term = searchTerm[ i ];
			const urlMatched = getByUrl( term );
			const nameMatched = getByName( term );

			if ( urlMatched || nameMatched ) {
				found = true;
				break;
			}
		}

		return found;
	}

	return {

		indexes: {
			name: {},
			url: {},
		},
		primeIndexes,

		fetch,
		getByUrl,
		getByName,
		getByKey,

		mangaIsTracked,

	};
}

window.query = initQuery();
