window.data = ( function initStorage() {
	return {

		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: {
				'd9266b7b-8eb5-4b50-9c77-feccc3fe3f6e': {
					_id: 'd9266b7b-8eb5-4b50-9c77-feccc3fe3f6e',
					name: 'Bleach',
					url: 'http://mangastream.com/manga/bleach',
					readTo: '656',
					latestChapter: '656',
				},
				'0f6a891f-140b-473c-b438-8a388d29e3a6': {
					_id: '0f6a891f-140b-473c-b438-8a388d29e3a6',
					name: 'Fairy Tale',
					url: 'http://mangastream.com/manga/fairy_tail',
					readTo: '463',
					latestChapter: '465',
				},
				'5e7b7a5d-97ef-4007-a187-a8c2b6a79d91': {
					_id: '5e7b7a5d-97ef-4007-a187-a8c2b6a79d91',
					name: 'One Piece',
					url: 'http://www.mangatown.com/manga/one_piece/',
					readTo: '12',
					latestChapter: '810',
				},
				'2c9404c8-341b-49ba-99a2-ef3a002b8bd7': {
					_id: '2c9404c8-341b-49ba-99a2-ef3a002b8bd7',
					name: 'The Gamer',
					url: 'http://www.mangatown.com/manga/the_gamer/',
					readTo: '112',
					latestChapter: '112',
				},
				'3580deb4-bef0-4319-aaf0-edf73492c5c9': {
					_id: '3580deb4-bef0-4319-aaf0-edf73492c5c9',
					name: 'UQ Holder!',
					url: 'http://www.mangahere.co/manga/uq_holder/',
					readTo: '106',
					latestChapter: '106',
				},
			},
		},

		getAll: () => {
			return new Promise( ( resolve, reject ) => {
				chrome.storage.sync.get( null, ( response ) => resolve( response ) );
			} );
		},

		saveChanges: () => {
			return new Promise( ( resolve, reject ) => {
				chrome.storage.sync.set( window.data.state, () => resolve( true ) );
			} );
		},
	};
}() );
