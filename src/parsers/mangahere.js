/**
 * Gets the chapter list from inside a manga
 * @param  {Document} page HTML of the page
 * @return {Array}      Array of Chapters found on the page in the [Number, Title, Url] format
 */
function getChaptersFromPage( HTML ) {
	const chapters = [];

	$( '#bottom_chapter_list option', HTML ).each( function getChapterInfo() {
		const option = $( this );

		const chapterTitle = option.text().trim();
		const chapterUrl = option.val();
		const chapterNum = parseFloat( chapterUrl.split( '/' ).slice( -2, -1 )[ 0 ].substr( 1 ) );

		chapters.push( [ chapterNum, chapterTitle, chapterUrl ] );
	} );

	return chapters;
}


/**
 * Get all the chapters of a manga from their profile page on a given site
 * @param  {Manga} manga The manga object being queried
 * @return {Promise}       Resolves to an array of Chapters in the [Number, Title, Url] format
 */
function getChapterList( manga ) {
	return fetch( manga.url ).then( ( response ) => {

		return response.text().then( ( pageHTML ) => {

			const chapterData = [];

			$( pageHTML ).find( '.detail_list ul li span.left a' ).each( ( index, element ) => {
				const option = $( element );

				const chapterTitle = option.text().trim();
				const chapterUrl = option.attr( 'href' );
				const chapterNum = parseFloat( chapterUrl.split( '/' ).slice( -2, -1 )[ 0 ].substr( 1 ) );

				chapterData.push( [ chapterNum, chapterTitle, chapterUrl ] );
			} );

			return chapterData;
		} );

	} );
}


/**
 * Retrieve information about the current Manga via a chapter page
 * @param  {HTML} page context for jQuery to search in
 * @return {Object}      Info object
 */
function getInformationFromCurrentPage( HTML ) {

	const search = $( '.readpage_top .title a', HTML );

	let name = $( search[ 1 ] ).text().trim();

	if ( name.substr( -5 ) === 'Manga' ) {
		name = name.substr( 0, name.length - 5 ).trim();
	}

	const currentChapterURL = $( search[ 0 ] ).attr( 'href' );
	const currentMangaURL = $( search[ 1 ] ).attr( 'href' );
	const currentChapterNumber = parseFloat( currentChapterURL.split( '/' ).slice( -2, -1 )[ 0 ].substr( 1 ) );

	return {
		name: name,
		currentChapter: currentChapterNumber,
		currentMangaURL: currentMangaURL,
		currentChapterURL: currentChapterURL,
	};
}


/**
 * Get the URLs of the pages for a chapter
 * @param  {HTML} page context for jQuery to search in
 * @return {Array}      the list of the pages in this chapter to be used later when making the image urls.
 */
function getPages( HTML ) {
	const pages = $( 'select[onchange*="change_page"] option', HTML ).map( ( index, element ) => $( element ).val() );
	return pages;
}


/**
 * This method returns the place to write the full chapter in the document
 * The returned element will be totally emptied.
 * @return {Selector}      CSS Element Selector
 */
function whereDoIWriteScans() {
	return '#viewer';
}


/**
 * Is the current page being viewed a chapter in a manga?
 * @param  {HTML}  page context for jQuery to search in
 * @return {Boolean}      Whether or not it is a page in a chapter
 */
function isCurrentPageAChapterPage( HTML ) {
	return $( '#image', HTML ).length > 0;
}


/**
 * Get the image URLs from all the chapter pages
 * @param  {String} url URL to visit to find page image on
 * @return {Promise}     Resolves to the URL of the desired Image
 */
function getImageFromPage( url ) {
	return fetch( url ).then( ( response ) => {
		return response.text().then( ( pageHTML ) => $( '#image', pageHTML ).attr( 'src' ) );
	} );
}


const parser = {

	name: 'Manga Here',
	normalizedName: 'mangahere', // No spaces, all lowercase
	urls: [ 'mangahere.co' ],

	getChaptersFromPage,
	getChapterList,
	getInformationFromCurrentPage,
	getPages,
	whereDoIWriteScans,
	isCurrentPageAChapterPage,
	getImageFromPage,

};

window.parsers.register( parser );
