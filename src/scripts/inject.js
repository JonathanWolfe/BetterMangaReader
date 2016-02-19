let parsedChapter;


function toggleTrackingButton( isTracking ) {
	const button = $( '#bmr-controls #tracking' );

	button.attr( 'disabled', false ).removeClass( 'pure-button-disabled' );

	if ( isTracking ) {
		button
			.addClass( 'pure-button-error' )
			.removeClass( 'pure-button-success' );
	} else {
		button
			.removeClass( 'pure-button-error' )
			.addClass( 'pure-button-success' );
	}
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
			<div class="form pure-form">
				<button id="prev-chapter" class="pure-button pure-button-primary">&laquo;</button>
				<select name="chapter-select" id="chapter-select">
					${chapterSelectOptions}
				</select>
				<button id="next-chapter" class="pure-button pure-button-primary">&raquo;</button>
				<button id="tracking" class="pure-button pure-button-disabled" disabled></button>
			</div>
		</div>`;

	$( 'body' ).append( bmrControls );

	toggleTrackingButton( parsedChapter.isTracked );

	const controls = $( '#bmr-controls' );
	const chapterList = $( 'option', controls );
	const selectedChapter = chapterList.filter( ':selected' );

	if ( selectedChapter.index() === 0 ) {
		$( '#prev-chapter', controls ).prop( 'disabled', true );
	}
	if ( selectedChapter.index() === chapterList.length - 1 ) {
		$( '#next-chapter', controls ).prop( 'disabled', true );
	}

	$( '#prev-chapter:not(:disabled)', controls ).on( 'click', ( ) => {
		const newLocation = chapterList.eq( selectedChapter.index() - 1 ).val();
		window.location.assign( newLocation );
	} );

	$( '#next-chapter:not(:disabled)', controls ).on( 'click', ( ) => {
		const newLocation = chapterList.eq( selectedChapter.index() + 1 ).val();
		window.location.assign( newLocation );
	} );

	$( 'select', controls ).on( 'change', ( ) => {
		const newLocation = $( 'option', this ).filter( ':selected' ).val();
		window.location.assign( newLocation );
	} );

	$( '#tracking', controls ).on( 'click', ( ) => {
		$( '#tracking', controls )
			.removeClass( 'pure-button-success pure-button-error' )
			.addClass( 'pure-button-disabled' )
			.attr( 'disabled', true );

		chrome.runtime.sendMessage( {
			action: 'toggleTracking',
			manga: parsedChapter.chapterInfo,
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
		const scans = [ ];
		scanContainer.empty();

		for ( let i = 0; i < parsedChapter.pages.length; i += 1 ) {
			scans.push( `<img src="${images[ i ]}" />` );
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

	toggleTrackingButton,
};

$( document ).ready( ( ) => {
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
