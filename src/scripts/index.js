function sortByMangaName( a, b ) {
	return $( '.manga-name', a ).text().localeCompare( $( '.manga-name', b ).text() );
}

function createMangaTable( bmrData ) {
	const mangaTable = $( '#manga-table tbody' );
	const rows = [];

	Object.keys( bmrData.tracking ).forEach( ( uuid ) => {
		const manga = bmrData.tracking[ uuid ];
		const row = $( `
				<tr id="${uuid}">
					<td class="manga-markRead">
						<button class="pure-button pure-button-warning">Mark Read</button>
					</td>
					<td class="manga-name">${manga.name}</td>
					<td class="manga-readTo">${manga.readTo}</td>
					<td class="manga-latest">${manga.latestChapter}</td>
				</tr>
			` );

		if ( parseFloat( manga.latestChapter ) > parseFloat( manga.readTo ) ) {
			row.addClass( 'has-unread' );
		}

		rows.push( row );
	} );

	const unread = rows.filter( ( row ) => row.hasClass( 'has-unread' ) ).sort( sortByMangaName );
	const read = rows.filter( ( row ) => !row.hasClass( 'has-unread' ) ).sort( sortByMangaName );

	console.log( 'unread', unread );
	console.log( 'read', read );

	mangaTable.prepend( unread );
	mangaTable.append( read );

	return mangaTable;
}

function bmrInit( bmrData ) {
	console.log( 'bmrData', bmrData );

	createMangaTable( bmrData );

	$( '#manga-table' ).on( 'click', 'tbody tr', function mangaClicked( event ) {
		const uuid = event.currentTarget.id;
		const manga = bmrData.tracking[ uuid ];

		window.location.assign( manga.url );
	} );
}

window.data.getFresh().then( bmrInit );
