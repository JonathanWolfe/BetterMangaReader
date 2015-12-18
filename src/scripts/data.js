window.data = ( function initStorage() {
	return {

		state: {
			editDate: ( new Date() ).toISOString(),
			tracking: [ {
				name: 'Bleach',
				url: 'http://mangastream.com/manga/bleach',
				readTo: '656',
				latestChapter: '656',
			}, {
				name: 'Fairy Tale',
				url: 'http://mangastream.com/manga/fairy_tail',
				readTo: '463',
				latestChapter: '465',
			}, {
				name: 'One Piece',
				url: 'http://www.mangatown.com/manga/one_piece/',
				readTo: '12',
				latestChapter: '810',
			}, {
				name: 'The Gamer',
				url: 'http://www.mangatown.com/manga/the_gamer/',
				readTo: '112',
				latestChapter: '112',
			}, {
				name: 'UQ Holder!',
				url: 'http://www.mangahere.co/manga/uq_holder/',
				readTo: '106',
				latestChapter: '106',
			} ],
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
