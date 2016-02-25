'use strict';

/**
 * Add a parser to the Collection
 * @param {Parser} parser The parser object to be added
 */
function register( parser ) {
	if ( !window.parsers[ parser.normalizedName ] ) {
		window.parsers[ parser.normalizedName ] = parser;
	}
}

/**
 * Adds missing parts of a url
 * @param  {String} url	Url to ensure is useable
 * @return {String}       Useable url
 */
function validUrl( url ) {
	const hasHTTP = url.includes( 'http://' ) || url.includes( 'https://' );
	return hasHTTP ? url : `http://${url}`;
}

/**
 * Normalize a URL for storage
 * No http, www, and include closing slash
 * @param  {String} url Url to normalize
 * @return {String}     Normalized URL
 */
function normalizeUrl( url ) {
	let normalized = url.toLowerCase().trim();

	normalized = normalized.replace( 'http://', '' ).replace( 'https://', '' );
	normalized = normalized.replace( 'www.', '' );

	if ( normalized.substr( -1 ) !== '/' ) {
		normalized += '/';
	}

	return normalized;
}

/**
 * Retrieves the HTML of a URL
 * @param  {String} url URL to scrape
 * @return {Promise}     Resolves with the HTML
 */
function getHtmlFromUrl( url ) {
	return window.fetch( url ).then(
		( response ) => response.text().then(
			( HTML ) => $( '<html />' ).append( HTML ).bmrLiteSanitize()
		)
	);
}

/**
 * Find a parser via a URL
 * @param  {String} url URL to search with
 * @return {Parser}     A Parser Object
 */
function findByUrl( url ) {
	const normalizedUrl = new window.URL( validUrl( url ) ).hostname;
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
}

/**
 * Build a tracking object from manga profile html
 * @param  {jQuery} parsedHTML jQuery Object of parsed HTML
 * @return {Object}            Manga object ready for applying to state
 */
function makeExpansion( manga, parsedHTML ) {
	// Get the parser for this manga
	const parser = findByUrl( manga.url );

	if ( !parser ) {
		console.error( "Can't find parser for: ", manga );
	}

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
		url: normalizeUrl( manga.url ),

		readTo: currentRead.toString(),
		readToUrl: normalizeUrl( currentChapter.url ),

		nextChapter: nextChapter.number.toString(),
		nextChapterUrl: normalizeUrl( nextChapter.url ),

		latestChapter: latestChapter.number.toString(),
		latestChapterUrl: normalizeUrl( latestChapter.url ),
	};

	// Generate a UUID and add it to the state
	return forTracking;
}

/**
 * Expand a manga from crompressed to full usefullness
 * @param  {Object} manga A compressed manga object
 * @return {Object}       An uncompressed manga object
 */
function expandMangaInfo( manga ) {
	// Get the HTML of the Manga's Profile page
	return getHtmlFromUrl( validUrl( manga.url ) )
		.then( ( parsedHTML ) => makeExpansion( manga, parsedHTML ) )
		.catch( ( ) => manga );
}

/**
 * Update a manga with the latest info
 * @param  {Object} manga The manga to update
 * @return {Object}       The manga updated with the latest info
 */
function updateMangaInfo( manga ) {
	const parser = findByUrl( manga.url );

	if ( !parser ) {
		console.error( 'Failed to find parser for: ', manga );
		return false;
	}

	return getHtmlFromUrl( validUrl( manga.url ) )
		.then( parser.getChaptersListFromProfile )
		.then( ( chapters ) => expandMangaInfo( manga, chapters ) );
}

/**
 * Update every manga in the state to the latest info
 * @return {Object} The updated state
 */
function updateAllManga() {
	console.log( 'Checking for Releases' );

	const uuids = Object.keys( window.data.state.tracking );
	const promises = uuids.map( ( uuid ) => {
		const manga = window.data.state.tracking[ uuid ];

		return updateMangaInfo( manga )
			.then( ( expanded ) => {
				window.data.state.tracking[ uuid ] = expanded;
			} );
	} );

	return Promise.all( promises ).then( window.data.saveChanges );
}

window.parsers = {

	register,
	findByUrl,
	expandMangaInfo,
	updateMangaInfo,
	updateAllManga,

	helpers: {
		validUrl,
		normalizeUrl,
		getHtmlFromUrl,
	},

};
