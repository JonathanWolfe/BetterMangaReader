function updateTrackingButtons() {
	$( '#BMRControls' ).append( '<button id="check-track" disabled>Checking...</button>' );
	$( '#BMRControls #go-track' ).remove();
	$( '#BMRControls #stop-track' ).remove();
}

function checkTracked( info ) {
	chrome.runtime.sendMessage( {
		isMangaTracked: info.name,
	}, function ( isTrackedResponse ) {
		console.log( 'check if tracking', isTrackedResponse );

		$( '#BMRControls #check-track' ).remove();

		if ( isTrackedResponse[ 0 ] === true ) {
			$( '#BMRControls' ).append( '<button id="stop-track">Stop Tracking</button>' );

			chrome.runtime.sendMessage( {
				updateMangaReadChapter: {
					id: isTrackedResponse[ 1 ],
					info: info,
				},
			}, function ( updateReadChapterResponse ) {
				console.log( updateReadChapterResponse );
			} );
		} else {
			$( '#BMRControls' ).append( '<button id="go-track">Track Manga</button>' );
		}
	} );
}

function buildControls( chapterInfo, chapters ) {

	const chapterSelectOptions = chapters.map( ( chapter ) => {
		const isCurrent = parseFloat( chapter[ 0 ] ) === parseFloat( chapterInfo.currentChapter );
		const selected = isCurrent ? 'selected' : '';

		return `<option value="${chapter[ 2 ]}" ${selected}>Chapter ${chapter[ 0 ]}</option>`;
	} ).join( '' );

	const iconURL = chrome.runtime.getURL( '../icons/icon19.png' );

	const bmrControls = `
	<div id="BMRControls">
		<img src="${iconURL}" alt="BetterMangaRead" />

		<button id="go-prev">&laquo;</button>

		<form>
			<select>
				${chapterSelectOptions}
			</select>
		</form>

		<button id="go-next">&raquo;</button>
	</div>`;

	return bmrControls;
}

function bmrInject() {
	$( 'body' ).append( `
		<div class="loading-wrap">
			<div class="loader"></div>
			<h2>BetterMangaReader Loading...</h2>
		</div>
	` );

	$( document ).ready( function () {
		let mirror;

		if ( mirror && mirror.isCurrentPageAChapterPage( document ) ) {

			const chapters = mirror.getChaptersFromPage( document );
			const chapterInfo = mirror.getInformationFromCurrentPage( document );

			console.log( 'chapterInfo', chapterInfo );

			mirror.removeRedundant( document );
			mirror.doSomethingBeforeWritingScans( document );

			const pages = mirror.getPages( document );
			const whereWrite = mirror.whereDoIWriteScans( document );

			$( whereWrite ).prepend( buildControls( chapterInfo, chapters ) );

			updateTrackingButtons();
			checkTracked( chapterInfo );

			const chapterList = $( '#BMRControls option' );
			const selectedChapter = chapterList.filter( ':selected' );

			if ( selectedChapter.index() === 0 ) {
				$( '#go-prev' ).prop( 'disabled', true );
			}
			if ( selectedChapter.index() === chapterList.length - 1 ) {
				$( '#go-next' ).prop( 'disabled', true );
			}

			$( '#BMRControls #go-prev:not(:disabled)' ).on( 'click', function () {
				const currentIndex = selectedChapter.index();
				const newLocation = chapterList.eq( currentIndex - 1 ).val();
				document.location = newLocation;
			} );
			$( '#BMRControls #go-next:not(:disabled)' ).on( 'click', function () {
				const currentIndex = selectedChapter.index();
				const newLocation = chapterList.eq( currentIndex + 1 ).val();
				document.location = newLocation;
			} );
			$( '#BMRControls select' ).on( 'change', function () {
				document.location = $( 'option', this ).filter( ':selected' ).val();
			} );

			pages.forEach( function ( page, index ) {
				const image = mirror.getImageFromPage( page );
				$( whereWrite ).append( '<img src="' + image + '" alt="" id="image-' + index + '" class="BMR-img" />' );
			} );

			mirror.doAfterMangaLoaded( document );
			$( '.loading-wrap' ).hide();

			$( '#BMRControls' )
				.on( 'click', '#go-track', function () {
					console.log( 'attempted to track' );

					updateTrackingButtons();

					const fullInfo = {
						"name": chapterInfo.name,
						"mirror": mirror.mirrorName,
						"url": chapterInfo.currentMangaURL,
						"urlOfLatestRead": chapterInfo.currentChapterURL,
						"isTracked": true,
						"latestRead": chapterInfo.currentChapter,
						"latest": chapters[ chapters.length - 1 ][ 0 ],
						"tags": [],
						"chapterList": chapters,
					};

					chrome.runtime.sendMessage( {
						mangaToTrack: fullInfo,
					}, function ( response ) {
						console.log( response );

						checkTracked( chapterInfo );
					} );
				} )
				.on( 'click', '#stop-track', function () {
					console.log( 'attempting to stop tracking' );

					updateTrackingButtons();

					chrome.runtime.sendMessage( {
						mangaToStopTracking: chapterInfo.name,
					}, function ( response ) {
						console.log( response );

						checkTracked( chapterInfo );
					} );
				} );
		} else {
			$( '.loading-wrap' ).hide();
		}

	} );
}

bmrInject();
