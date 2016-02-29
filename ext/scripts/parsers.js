'use strict';

/**
 * Add a parser to the Collection
 * @param {Parser} parser The parser object to be added
 */
function register( parser ) {
	// Don't duplicate
	if ( !window.parsers[ parser.normalizedName ] ) {
		// apply to var
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
	return hasHTTP ? url : `http://${url}`; // Add http if it doesn't have it
}

/**
 * Normalize a URL for storage
 * No http, www, and include closing slash
 * @param  {String} url Url to normalize
 * @return {String}     Normalized URL
 */
function normalizeUrl( url ) {
	let normalized = url.trim();

	// remove http(s) and www.
	normalized = normalized.replace( 'http://', '' ).replace( 'https://', '' );
	normalized = normalized.replace( 'www.', '' );

	// add ending slash if missing
	if ( normalized.substr( -1 ) !== '/' ) {
		normalized += '/';
	}

	return normalized;
}

function normalizeAllFields( manga ) {
	manga.url = normalizeUrl( manga.url );

	manga.readTo = manga.readTo.toString();
	manga.readToUrl = normalizeUrl( manga.readToUrl );

	manga.nextChapter = manga.nextChapter.toString();
	manga.nextChapterUrl = normalizeUrl( manga.nextChapterUrl );

	manga.latestChapter = manga.latestChapter.toString();
	manga.latestChapterUrl = normalizeUrl( manga.latestChapterUrl );

	return manga;
}

/**
 * Retrieves the HTML of a URL
 * @param  {String} url URL to scrape
 * @return {Promise}     Resolves with the HTML
 */
function getHtmlFromUrl( url ) {
	// fetch the given url
	return window.fetch( url ).then(
		// convert to text
		( response ) => response.text().then(
			// create a html element in memory and sanitize it
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
	// use URL methods from the browser to get the hostname
	const normalizedUrl = new window.URL( validUrl( url ) ).hostname;
	// get all our parsers
	const parsers = Object.keys( window.parsers );
	// set default response
	let parser = false;

	// loop over parsers
	for ( let i = 0; i < parsers.length; i += 1 ) {
		// currently trying this parser
		const trying = window.parsers[ parsers[ i ] ];
		// parser has urls to match against
		if ( trying.urls ) {
			// see if allowed urls matches the url being checked
			const normal = trying.urls.includes( normalizedUrl );
			// try without www.
			const noWWW = trying.urls.includes( normalizedUrl.replace( 'www.', '' ) );

			// Found the parser
			if ( normal || noWWW ) {
				// change return to the parser
				parser = trying;
				// break out of the loop
				break;
			}
		}
	}

	return parser;
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
	const forTracking = normalizeAllFields( {
		name: manga.name,
		url: manga.url,

		readTo: currentRead,
		readToUrl: currentChapter.url,

		nextChapter: nextChapter.number,
		nextChapterUrl: nextChapter.url,

		latestChapter: latestChapter.number,
		latestChapterUrl: latestChapter.url,
	} );

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
		.then( ( parsedHTML ) => makeExpansion( manga, parsedHTML ) ) // Expand the manga to a valid structure
		.catch( ( ) => manga ); // Return our input if fails
}

/**
 * Update a manga with the latest info
 * @param  {Object} manga The manga to update
 * @return {Object}       The manga updated with the latest info
 */
function updateMangaInfo( manga ) {
	// find the parser for this manga
	const parser = findByUrl( manga.url );

	if ( !parser ) {
		console.error( 'Failed to find parser for: ', manga );
		return false;
	}

	// Get the HTML from the manga's profile page
	return getHtmlFromUrl( validUrl( manga.url ) )
		.then( parser.getChaptersListFromProfile ) // Get the manga's chapters
		.then( ( chapters ) => expandMangaInfo( manga, chapters ) ); // expand the manga info to be valid
}

/**
 * Update every manga in the state to the latest info
 * @return {Object} The updated state
 */
function updateAllManga() {
	console.log( 'Checking for Releases' );

	// Get the manga UUIDs to loop over
	const uuids = Object.keys( window.data.state.tracking );
	// Loop over each uuid
	// Update the manga's info to the latest
	const promises = uuids.map( ( uuid ) => updateMangaInfo( window.data.state.tracking[ uuid ] )
		.then( ( expanded ) => {
			// overwrite the old with the updated
			window.data.state.tracking[ uuid ] = expanded;
		} )
	);

	// Save when all manga are done updating
	return Promise.all( promises ).then( window.data.saveChanges );
}

// initialize
window.parsers = {

	register, // expose function

	findByUrl, // expose function

	expandMangaInfo, // expose function

	updateMangaInfo, // expose function
	updateAllManga, // expose function

	helpers: {
		validUrl, // expose function

		normalizeUrl, // expose function
		normalizeAllFields, // expose function

		getHtmlFromUrl, // expose function
	},

};
