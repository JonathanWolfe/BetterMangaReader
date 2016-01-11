window.data = ( function initStorage() {
	function normalizeUrl( url ) {
		let normalized = url.toLowerCase().trim();

		normalized = normalized.replace( 'http://', '' ).replace( 'https://', '' );
		normalized = normalized.replace( 'www.', '' );

		if ( normalized.substr( -1 ) !== '/' ) normalized += '/';

		return normalized;
	}

	return {

		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: {
				'd9266b7b-8eb5-4b50-9c77-feccc3fe3f6e': {
					name: 'Bleach',
					url: 'mangastream.com/manga/bleach/',
					readTo: '656',
					latestChapter: '656',
				},
				'0f6a891f-140b-473c-b438-8a388d29e3a6': {
					name: 'Fairy Tail',
					url: 'mangastream.com/manga/fairy_tail/',
					readTo: '463',
					latestChapter: '465',
				},
				'5e7b7a5d-97ef-4007-a187-a8c2b6a79d91': {
					name: 'One Piece',
					url: 'mangatown.com/manga/one_piece/',
					readTo: '12',
					latestChapter: '810',
				},
				'2c9404c8-341b-49ba-99a2-ef3a002b8bd7': {
					name: 'The Gamer',
					url: 'mangatown.com/manga/the_gamer/',
					readTo: '112',
					latestChapter: '112',
				},
				'3580deb4-bef0-4319-aaf0-edf73492c5c9': {
					name: 'UQ Holder!',
					url: 'mangahere.co/manga/uq_holder/',
					readTo: '106',
					latestChapter: '106',
				},
			},
		},

		indexes: {},

		primeIndexes: () => {
			window.data.indexes.name = {};
			window.data.indexes.url = {};

			Object.keys( window.data.state.tracking ).forEach( ( uuid ) => {
				const current = window.data.state.tracking[ uuid ];

				window.data.indexes.name[ current.name.toLowerCase().trim() ] = uuid;
				window.data.indexes.url[ normalizeUrl( current.url ) ] = uuid;
			} );

			return window.data.indexes;
		},

		fetch: ( uuid ) => window.data.state.tracking[ uuid ],

		getByKey: ( key, searchValue ) => {
			if ( typeof window.data.indexes[ key ] === 'undefined' ) {
				throw new Error( 'Invalid Query Key: ' + key );
			}
			return window.data.indexes[ key ][ searchValue ];
		},

		getByUrl: ( mangaUrl ) => window.data.getByKey( 'url', normalizeUrl( mangaUrl ) ),

		getByName: ( mangaName ) => window.data.getByKey( 'name', mangaName.toLowerCase().trim() ),

		mangaIsTracked: ( mangaUrl, mangaName ) => {
			const urlMatched = window.data.getByUrl( mangaUrl );
			const nameMatched = window.data.getByName( mangaName );

			if ( urlMatched || nameMatched ) return true;

			return false;
		},

		getFresh: () => {
			return new Promise( ( resolve, reject ) => {
				chrome.storage.sync.get( null, ( response ) => {
					window.data.state = response;
					window.data.primeIndexes();
					resolve( response );
				} );
			} );
		},

		saveChanges: () => {
			return new Promise( ( resolve, reject ) => {
				chrome.storage.sync.set( window.data.state, () => window.data.getFresh().then( resolve ) );
			} );
		},
	};
}() );

window.data.primeIndexes();
