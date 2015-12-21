let parsedChapter;


function toggleTrackingButton( isTracking ) {

}


function buildControls() {
	const chapterSelectOptions = parsedChapter.chapterListFromChapter.map( ( chapter ) => {
		const isCurrent = parseFloat( chapter.number ) === parseFloat( parsedChapter.chapterInfo.number );
		const selected = isCurrent ? 'selected' : '';

		return `<option value="${chapter.url}" ${selected}>Chapter ${chapter.number} &mdash; ${chapter.title}</option>`;
	} ).join( '' );

	const iconURL = chrome.runtime.getURL( '../icons/icon19.png' );

	const bmrControls = `<div id="bmr-controls" class="bettermangareader">
			<img src="${iconURL}" alt="BetterMangaReader" />
			<form class="pure-form">
				<button id="prev-chapter" class="pure-button pure-button-primary">&laquo;</button>
				<select name="chapter-select" id="chapter-select">
					${chapterSelectOptions}
				</select>
				<button id="next-chapter" class="pure-button pure-button-primary">&raquo;</button>
				<button id="tracking" class="pure-button pure-button-disabled" disabled></button>
			</form>
		</div>`;

	$( 'body' ).append( bmrControls );

	toggleTrackingButton();

	const chapterList = $( '#BMRControls option' );
	const selectedChapter = chapterList.filter( ':selected' );

	if ( selectedChapter.index() === 0 ) {
		$( '#prev-chapter' ).prop( 'disabled', true );
	}
	if ( selectedChapter.index() === chapterList.length - 1 ) {
		$( '#next-chapter' ).prop( 'disabled', true );
	}

	$( '#BMRControls #prev-chapter:not(:disabled)' ).on( 'click', function goToPrevChapter() {
		const newLocation = chapterList.eq( selectedChapter.index() - 1 ).val();
		document.location = newLocation;
	} );

	$( '#BMRControls #next-chapter:not(:disabled)' ).on( 'click', function goToNextChapter() {
		const newLocation = chapterList.eq( selectedChapter.index() + 1 ).val();
		document.location = newLocation;
	} );

	$( '#BMRControls select' ).on( 'change', function goToThisChapter() {
		document.location = $( 'option', this ).filter( ':selected' ).val();
	} );

	$( '#BMRControls' ).on( 'click', '#tracking', function toggleTracking() {
		$( 'tracking' ).attr( 'disabled', false ).toggleClass( 'pure-button-success' ).toggleClass( 'pure-button-error' );

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
