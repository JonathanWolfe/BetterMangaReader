'use strict';

function initQuery() {
	/**
	 * Prime the indexes for use
	 * @return {Object} The finalized indexes
	 */
	function primeIndexes() {
		// save typing
		const mangas = window.data.state.tracking;

		// base values
		const names = { };
		const urls = { };

		// loop over all mangas
		Object.keys( mangas ).forEach( ( uuid ) => {
			// current manga
			const current = mangas[ uuid ];
			// processed name
			const name = current.name.toLowerCase().trim();
			// processed url
			const url = window.parsers.helpers.normalizeUrl( current.url );

			// add to index as key with value as manga UUID
			names[ name ] = uuid;
			urls[ url ] = uuid;
		} );

		// update global indexes
		window.query.indexes.name = names;
		window.query.indexes.url = urls;

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
		// Key exists to search by
		if ( typeof window.query.indexes[ key ] === 'undefined' ) {
			throw new Error( `Invalid Query Key: ${key}` );
		}
		// return what we find, if anything
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
		// default value
		let found = false;

		// loop over all search terms
		for ( let i = 0; i < searchTerm.length; i += 1 ) {
			// current search term
			const term = searchTerm[ i ];
			// found a match on the URL?
			const urlMatched = getByUrl( term );
			// found a match on the name?
			const nameMatched = getByName( term );

			// found either by name or url?
			if ( urlMatched || nameMatched ) {
				// update return value
				found = true;
				// break out of loop
				break;
			}
		}

		return found;
	}

	return {

		// set base index values
		indexes: {
			name: {},
			url: {},
		},
		primeIndexes, // expose function

		fetch, // expose function
		getByUrl, // expose function
		getByName, // expose function
		getByKey, // expose function

		mangaIsTracked, // expose function

	};
}

// initialize
window.query = initQuery();
