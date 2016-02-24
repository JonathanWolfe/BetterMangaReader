'use strict';

function sortByMangaName( a, b ) {
	return $( '.manga-name', a ).text().localeCompare( $( '.manga-name', b ).text() );
}

function createMangaTable( bmrData ) {
	const mangaTable = $( '#manga-table tbody' );
	const rows = [ ];

	Object.keys( bmrData.tracking ).forEach( ( uuid ) => {
		const manga = bmrData.tracking[ uuid ];
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

function bmrInit( bmrData ) {
	console.group( `Tracked Manga as of ${bmrData.editDate}` );
	console.table( bmrData.tracking );
	console.groupEnd();

	createMangaTable( bmrData );

	$( '#manga-table' ).on( 'click', 'tbody tr', ( event ) => {
		const uuid = event.currentTarget.id;
		const manga = bmrData.tracking[ uuid ];

		window.location.assign( window.parsers.helpers.validUrl( manga.nextChapterUrl ) );
	} );

	$( '#manga-table' ).on( 'click', '.manga-markRead button', ( event ) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		const uuid = $( event.target ).data( 'uuid' );

		return window.data.markRead( uuid )
			.then( window.data.getFresh )
			.then( bmrInit );
	} );
}

window.data.getFresh().then( bmrInit );
