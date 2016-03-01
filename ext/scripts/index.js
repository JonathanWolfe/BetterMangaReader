'use strict';

// get the background page
const bgPage = chrome.extension.getBackgroundPage();

// Sort the manga alphabetically
function sortByMangaName( a, b ) {
	return $( '.manga-name', a ).text().localeCompare( $( '.manga-name', b ).text() );
}

/**
 * Fill the Manga table HTML with data
 * @return {jQuery} The manga table instance
 */
function createMangaTable() {
	// quick access
	const mangaTable = $( '#manga-table tbody' );
	const mangas = bgPage.data.state.tracking;
	const uuids = Object.keys( mangas );

	// placeholder
	const rows = [ ];

	// Do they have any manga?
	if ( uuids.length ) {
		// Hide the load example button
		$( '#load-example' ).hide();
	} else {
		// when clicked
		$( '#load-example' ).on( 'click', ( event ) => {
			// load the example data then refresh currently viewed tab
			bgPage.data.loadExample().then( ( ) => chrome.tabs.reload() );
		} );
	}

	// loop over every manga
	uuids.forEach( ( uuid ) => {
		// current manga to process
		const manga = mangas[ uuid ];

		// built row HTML
		const row = $( `
				<tr id="${uuid}">
					<td class="manga-markRead">
						<button data-uuid="${uuid}" class="pure-button pure-button-warning">Mark Read</button>
					</td>
					<td class="manga-name">${manga.name}</td>
					<td class="manga-readTo">${manga.readTo}</td>
					<td class="manga-latest">${manga.latestChapter}</td>
				</tr>` );

		// add `.has-unread` if latestChapter is greater than readTo
		if ( parseFloat( manga.latestChapter ) > parseFloat( manga.readTo ) ) {
			row.addClass( 'has-unread' );
		}

		// add to our placeholder
		rows.push( row );
	} );

	// Get all the manga that are unread
	const unread = rows.filter( ( row ) => row.hasClass( 'has-unread' ) ).sort( sortByMangaName );
	// Get all the manga that are read
	const read = rows.filter( ( row ) => !row.hasClass( 'has-unread' ) ).sort( sortByMangaName );

	// remove what's there, if anything
	mangaTable.empty();
	// Unread go onto the top
	mangaTable.prepend( unread );
	// Read go onto the bottom
	mangaTable.append( read );

	return mangaTable;
}

/**
 * Initialize the page
 * @return {Undefined} No return
 */
function bmrInit() {
	// save on typing
	const state = bgPage.data.state;

	// Log our initial data
	console.groupCollapsed( `Tracked Manga as of ${state.editDate}` );
	console.table( state.tracking );
	console.groupEnd();

	// Show the number of tracked manga
	$( '#number-of-manga span' ).text( Object.keys( state.tracking ).length );
	// Show the capactiy used
	bgPage.data.capacityUsed().then( ( percent ) => $( '#capacity-used span' ).text( percent ) );

	// create the manga table
	createMangaTable( state );

	// Open the next chapter URL when clicking on a manga's row
	$( '#manga-table' ).on( 'click', 'tbody tr', ( event ) => {
		const uuid = event.currentTarget.id;
		const manga = state.tracking[ uuid ];

		window.location.assign( bgPage.parsers.helpers.validUrl( manga.nextChapterUrl ) );
	} );

	// Update the manga as being fully read
	$( '#manga-table' ).on( 'click', '.manga-markRead button', ( event ) => {
		// don't bubble up and activate the manga row handler
		event.preventDefault();
		event.stopImmediatePropagation();

		// What button and manga was clicked
		const button = $( event.target );
		const uuid = button.data( 'uuid' );

		// No repeat clicks
		button.attr( 'disabled', true );

		// Mark as read then refresh page
		return bgPage.data.markRead( uuid )
			.then( bgPage.data.getFresh )
			.then( bmrInit );
	} );
}

// If we have a bg page start the display
if ( bgPage ) {
	bmrInit();
} else {
	throw new Error( 'Failed to connect to background page' );
}
