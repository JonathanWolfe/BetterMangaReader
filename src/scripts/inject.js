let parsedChapter;


function toggleTrackingButton( isTracking ) {
	if ( typeof isTracking === 'undefined' ) {
		$( 'BMRControls #check-track' ).show();
		$( '#BMRControls #start-track' ).hide();
		$( '#BMRControls #stop-track' ).hide();
	} else {
		$( '#BMRControls #check-track' ).hide();
	}

	if ( isTracking === true ) {
		$( '#BMRControls #start-track' ).show();
		$( '#BMRControls #stop-tack' ).hide();
	}
	if ( isTracking === false ) {
		$( '#BMRControls #start-track' ).hide();
		$( '#BMRControls #stop-tack' ).show();
	}
}


function buildControls() {
	const chapterSelectOptions = parsedChapter.chapterListFromChapter.map( ( chapter ) => {
		const isCurrent = parseFloat( chapter.number ) === parseFloat( parsedChapter.chapterInfo.number );
		const selected = isCurrent ? 'selected' : '';

		return `<option value="${chapter.url}" ${selected}>Chapter ${chapter.number} &mdash; ${chapter.title}</option>`;
	} ).join( '' );

	const iconURL = chrome.runtime.getURL( '../icons/icon19.png' );

	const bmrControls = `<div id="BMRControls">
			<img src="${iconURL}" alt="BetterMangaRead" />
			<button id="go-prev">&laquo;</button>
			<select>
				${chapterSelectOptions}
			</select>
			<button id="go-next">&raquo;</button>
			<button id="check-track" disabled>Checking...</button>
			<button id="stop-track">Stop Tracking</button>
			<button id="start-track">Track Manga</button>
		</div>`;

	$( 'body' ).append( bmrControls );

	toggleTrackingButton();

	const chapterList = $( '#BMRControls option' );
	const selectedChapter = chapterList.filter( ':selected' );

	if ( selectedChapter.index() === 0 ) {
		$( '#go-prev' ).prop( 'disabled', true );
	}
	if ( selectedChapter.index() === chapterList.length - 1 ) {
		$( '#go-next' ).prop( 'disabled', true );
	}

	$( '#BMRControls #go-prev:not(:disabled)' ).on( 'click', function goToPrevChapter() {
		const currentIndex = selectedChapter.index();
		const newLocation = chapterList.eq( currentIndex - 1 ).val();
		document.location = newLocation;
	} );
	$( '#BMRControls #go-next:not(:disabled)' ).on( 'click', function goToNextChapter() {
		const currentIndex = selectedChapter.index();
		const newLocation = chapterList.eq( currentIndex + 1 ).val();
		document.location = newLocation;
	} );
	$( '#BMRControls select' ).on( 'change', function goToThisChapter() {
		document.location = $( 'option', this ).filter( ':selected' ).val();
	} );

	$( '#BMRControls' )
		.on( 'click', '#start-track', function startTracking() {
			toggleTrackingButton( true );

			chrome.runtime.sendMessage( {
				startTracking: parsedChapter.chapterInfo,
			} );
		} )
		.on( 'click', '#stop-track', function stopTracking() {
			toggleTrackingButton( false );

			chrome.runtime.sendMessage( {
				stopTracking: parsedChapter.chapterInfo,
			} );
		} );

}

function addBMRLoading() {
	$( 'body' ).append( `
		<div class="loading-wrap">
			<div class="loader"></div>
			<h2>BetterMangaReader Loading...</h2>
		</div>
	` );
}


function hideBMRLoading() {
	$( '.loading-wrap' ).hide();
}


const events = {
	getImagesForChapter: ( clonedHTML ) => {
		chrome.runtime.sendMessage( {
			action: 'getImagesForChapter',
			html: clonedHTML,
		} );
	},

	putImagesForChapter: ( images ) => {
		const scanContainer = $( parsedChapter.scanContainer );
		const scans = [];
		scanContainer.empty();

		for ( let i = 0; i < parsedChapter.pages.length; i += 1 ) {
			scans.push( '<img src="' + images[ i ] + '" />' );
		}

		scanContainer.append( scans.join( "\r\n" ) );

		hideBMRLoading();
		buildControls();
	},

	parseChapterPage: ( clonedHTML ) => {
		chrome.runtime.sendMessage( {
			action: 'parseChapterPage',
			html: clonedHTML,
		}, ( response ) => {
			if ( response && response.type === 'success' ) {
				parsedChapter = response.value;
				events.getImagesForChapter( clonedHTML );
			}
		} );
	},


};

$( document ).ready( function initBMRInject() {
	addBMRLoading();


	let clonedHTML = $( 'body' ).clone();
	clonedHTML.bmrLiteSanitize();
	clonedHTML = clonedHTML.html();


	chrome.runtime.onMessage.addListener( function processMessage( message, sender ) {
		if ( typeof events[ message.action ] === 'function' ) {
			events[ message.action ].call( this, message.value );
		}
	} );


	chrome.runtime.sendMessage( {
		action: 'parseHTML',
		html: clonedHTML,
	}, ( response ) => {
		if ( !response ) {
			console.error( 'Chrome Extension Error: ', chrome.runtime.lastError );
			hideBMRLoading();
		}

		if ( response.type === 'success' ) {
			if ( response.value.isChapterPage ) {
				events.parseChapterPage( clonedHTML );
			} else {
				hideBMRLoading();
			}
		} else {
			console.error( 'BMR Error: ', response.value );
			hideBMRLoading();
		}
	} );
} );
