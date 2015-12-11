/**
 * Convert AMR schema to BMR schema
 * @param  {String} data AMR's exported "JSON"
 * @return {Array}      Array of converted Manga
 */
function amr_converter( data ) {
	'use strict';

	const all_converted = [];
	const mangas_added = [];

	// Clean up AMR's double escaping
	data = data.replace( /(\\")+/g, '"' );
	data = data.replace( /("\[)+/g, '[' );
	data = data.replace( /(\]")+/g, ']' );

	const amr = JSON.parse( data );

	amr.mangas.forEach( function ( manga, key ) {

		if ( mangas_added.indexOf( manga.name ) === -1 ) { // Drop duplicates
			mangas_added.push( manga.name );

			all_converted.push( {
				id: key,
				name: manga.name,
				mirror: manga.mirror,
				url: manga.url,
				urlOfLatestRead: manga.lastChapterReadURL,
				isTracked: ( manga.display === 0 ? true : false ),
				latestRead: ( manga.lastChapterReadURL.match( /(\/|c)?([0-9]{2,3})(\.[0-9])?/ ) )[ 0 ].substr( 1 ),
				latest: '999',
				tags: manga.cats,
				chapter_list: [
					[ '999', '999', manga.url ]
				]
			} );
		}

	} );

	return all_converted;

};
