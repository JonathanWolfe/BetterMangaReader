( function initParser() {

	const parser = {

		name: 'MangaStream',
		normalizedName: 'readms', // should be the main part of the/a url. No prefix or suffixs.
		urls: [ 'readms.com', 'mangastream.com' ],


		/**
		 * Gets the chapter list from inside a manga
		 * @param  {HTML} HTML HTML of the page
		 * @return {Array}      Array of Chapters found on the page in the [Number, Title, Url] format
		 */
		getChaptersListFromChapter: ( HTML ) => {
			const chapters = [];

			$( '#bottom_chapter_list option', HTML ).each( ( index, element ) => {
				const chapterTitle = $( '.visible-desktop', element ).text().trim();
				const chapterUrl = $( element ).attr( 'href' );
				const chapterNum = parseFloat( $( '.visible-phone', element ).text().trim() );

				chapters.shift( [ chapterNum, chapterTitle, chapterUrl ] );
			} );

			return chapters;
		},


		/**
		 * Get all the chapters of a manga from their profile page on a given site
		 * @param  {HTML} HTML HTML of the manga's profile page
		 * @return {Promise}       Resolves to an array of Chapters in the [Number, Title, Url] format
		 */
		getChaptersListFromProfile: ( HTML ) => {
			const chapters = [];

			$( '.table-striped a', HTML ).each( ( index, element ) => {
				const chapterTitle = $( element ).text().trim();
				const chapterUrl = $( element ).attr( 'href' );
				const chapterNum = parseFloat( chapterTitle.split( ' - ' )[ 1 ] );

				chapters.push( [ chapterNum, chapterTitle, chapterUrl ] );
			} );

			return chapters;
		},


		/**
		 * Retrieve information about the current Manga via a chapter page
		 * @param  {HTML} HTML context for jQuery to search in
		 * @return {Object}      Info object
		 */
		getChapterInfo: ( HTML ) => {
			const mangaName = $( '.dropdown-toggle .visible-desktop:first', HTML ).text().trim();
			const chapterNum = parseFloat( $( '.dropdown-toggle .visible-desktop:last', HTML ).text().split( ' - ' )[ 1 ].trim() );
			const mangaUrl = $( '.btn-group .dropdown-menu:first a:last', HTML ).attr( 'href' );
			const chapterUrl = $( '.dropdown-menu:last a:first', HTML ).attr( 'href' );

			return {
				mangaName,
				chapterNum,
				mangaUrl,
				chapterUrl,
			};
		},


		/**
		 * Get the Urls of the pages for a chapter
		 * @param  {HTML} HTML HTML of the page
		 * @return {Array}      The list of the pages in this chapter to be used later when making the image urls.
		 */
		getPages: ( HTML ) => {
			const pages = [];
			const lastPage = $( '.dropdown-menu:last li:last a', HTML ).attr( 'href' );
			const numPages = lastPage.split( '/' ).pop();

			for ( let i = 1; i <= numPages; i += 1 ) {
				pages.push( lastPage.substr( 0, lastPage.length - numPages.length ) + i );
			}

			return pages;
		},


		/**
		 * This method returns the place to write the full chapter in the document
		 * The returned element will be totally emptied.
		 * @return {Selector}      CSS Element Selector
		 */
		scanContainer: () => '.page',


		/**
		 * Is the current page being viewed a chapter in a manga?
		 * @param  {HTML}  HTML HTML of the page
		 * @return {Boolean}      Whether or not it is a page in a chapter
		 */
		isChapterPage: ( HTML ) => $( '.page', HTML ).length > 0,


		/**
		 * Is the current page being viewed a profile page for a manga?
		 * @param  {HTML}  HTML HTML of the page
		 * @return {Boolean}      Whether or not it is a profile page for a manga
		 */
		isProfilePage: ( HTML ) => $( '.main-body .span8 > .table-striped tbody > tr:first-of-type th:first-of-type', HTML ).text().toLowerCase() === 'chapter',


		/**
		 * Get the image Urls from all the chapter pages
		 * @param  {HTML} HTML HTML of a chapter page
		 * @return {Promise}     Resolves to the Url of the desired Image
		 */
		getImageFromPage: ( HTML ) => $( '.page img', HTML ).attr( 'src' ),

	};


	/**
	 * Register the Parser so it can be accessed
	 */
	window.parsers.register( parser );
	return parser;
}() );
