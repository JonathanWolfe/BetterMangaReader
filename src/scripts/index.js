function bmrInit() {

	window.data.getAll().then( ( bmrData ) => {
		console.log( 'bmrData', bmrData );

		const mangaTable = $( '#manga-table tbody' );

		Object.keys( bmrData.tracking ).forEach( ( uuid ) => {
			const manga = bmrData.tracking[ uuid ];
			mangaTable.append( `
				<tr id="${uuid}">
					<td data-title="Mark Read" class="manga-markRead">
						<button class="pure-button pure-button-warning">Mark Read</button>
					</td>
					<td data-title="Manga Name" class="manga-name">${manga.name}</td>
					<td data-title="Read To" class="manga-readTo">${manga.readTo}</td>
					<td data-title="Latest" class="manga-latest">${manga.latestChapter}</td>
				</tr>
			` );
		} );
	} );

}

window.data.saveChanges().then( bmrInit );
