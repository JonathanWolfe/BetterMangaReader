'use strict';

const bgPage = chrome.extension.getBackgroundPage();

function sortByMangaName( a, b ) {
	return $( '.manga-name', a ).text().localeCompare( $( '.manga-name', b ).text() );
}

function createMangaTable() {
	const mangaTable = $( '#manga-table tbody' );
	const rows = [ ];

	if ( typeof bgPage.data.state.tracking === 'undefined' ) {
		$( '#load-example' ).on( 'click', ( event ) => {
			bgPage.data.loadExample().then( chrome.tabs.reload );
		} );
	} else {
		$( '#load-example' ).hide();
	}

	Object.keys( bgPage.data.state.tracking ).forEach( ( uuid ) => {
		const manga = bgPage.data.state.tracking[ uuid ];
		const row = $( `
				<tr id="${uuid}">
					<td class="manga-markRead">
						<button data-uuid="${uuid}" class="pure-button pure-button-warning">Mark Read</button>
					</td>
					<td class="manga-name">${manga.name}</td>
					<td class="manga-readTo">${manga.readTo}</td>
					<td class="manga-latest">${manga.latestChapter}</td>
				</tr>` );

		if ( parseFloat( manga.latestChapter ) > parseFloat( manga.readTo ) ) {
			row.addClass( 'has-unread' );
		}

		rows.push( row );
	} );

	const unread = rows.filter( ( row ) => row.hasClass( 'has-unread' ) ).sort( sortByMangaName );
	const read = rows.filter( ( row ) => !row.hasClass( 'has-unread' ) ).sort( sortByMangaName );

	mangaTable.empty();
	mangaTable.prepend( unread );
	mangaTable.append( read );
}

function bmrInit() {
	console.group( `Tracked Manga as of ${bgPage.data.state.editDate}` );
	console.table( bgPage.data.state.tracking );
	console.groupEnd();

	createMangaTable( bgPage.data.state );

	$( '#manga-table' ).on( 'click', 'tbody tr', ( event ) => {
		const uuid = event.currentTarget.id;
		const manga = bgPage.data.state.tracking[ uuid ];

		window.location.assign( bgPage.parsers.helpers.validUrl( manga.nextChapterUrl ) );
	} );

	$( '#manga-table' ).on( 'click', '.manga-markRead button', ( event ) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		const uuid = $( event.target ).data( 'uuid' );

		return bgPage.data.markRead( uuid )
			.then( bgPage.data.getFresh )
			.then( bmrInit );
	} );
}

if ( bgPage ) {
	bmrInit();
} else {
	console.error( 'Failed to connect to background page' );
}
