// Taken then modified from somewhere on Stack Overflow
jQuery.fn.whitespaceClean = function whitespaceClean() {

	this.contents().filter( function findWhiteSpace() {
		if ( this.nodeType !== 3 && this.nodeType !== 8 ) {
			$( this ).whitespaceClean();
			return false;
		} else if ( this.nodeType === 8 ) {
			return true;
		} else {
			this.textContent = $.trim( this.textContent );
			return !/\S/.test( this.nodeValue );
		}
	} ).remove();

	return this;
};

jQuery.fn.bmrLiteSanitize = function bmrLiteSanitize() {

	// Nuke Scripts and iframes
	this.find( 'script, iframe' ).remove();

	// Nuke Inline Events
	this.find( '*[onclick], *[oncontextmenu], *[ondblclick], *[onmousedown], *[onmouseenter], *[onmouseleave], *[onmousemove], *[onmouseover], *[onmouseout], *[onmouseup], *[onkeydown], *[onkeypress], *[onkeyup], *[onabort], *[onbeforeunload], *[onerror], *[onhashchange], *[onload], *[onpageshow], *[onpagehide], *[onresize], *[onscroll], *[onunload], *[onblur], *[onchange], *[onfocus], *[onfocusin], *[onfocusout], *[oninput], *[oninvalid], *[onreset], *[onsearch], *[onselect], *[onsubmit], *[ondrag], *[ondragend], *[ondragenter], *[ondragleave], *[ondragover], *[ondragstart], *[ondrop], *[oncopy], *[oncut], *[onpaste], *[onafterprint], *[onbeforeprint], *[onabort], *[oncanplay], *[oncanplaythrough], *[ondurationchange], *[onemptied], *[onended], *[onerror], *[onloadeddata], *[onloadedmetadata], *[onloadstart], *[onpause], *[onplay], *[onplaying], *[onprogress], *[onratechange], *[onseeked], *[onseeking], *[onstalled], *[onsuspend], *[ontimeupdate], *[onvolumechange], *[onwaiting], *[animationend], *[animationiteration], *[animationstart], *[transitionend], *[onerror], *[onmessage], *[onopen], *[onmessage], *[onmousewheel], *[ononline], *[onoffline], *[onpopstate], *[onshow], *[onstorage], *[ontoggle], *[onwheel], *[ontouchcancel], *[ontouchend], *[ontouchmove], *[ontouchstart]' ).removeAttr( 'onclick oncontextmenu ondblclick onmousedown onmouseenter onmouseleave onmousemove onmouseover onmouseout onmouseup onkeydown onkeypress onkeyup onabort onbeforeunload onerror onhashchange onload onpageshow onpagehide onresize onscroll onunload onblur onchange onfocus onfocusin onfocusout oninput oninvalid onreset onsearch onselect onsubmit ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop oncopy oncut onpaste onafterprint onbeforeprint onabort oncanplay oncanplaythrough ondurationchange onemptied onended onerror onloadeddata onloadedmetadata onloadstart onpause onplay onplaying onprogress onratechange onseeked onseeking onstalled onsuspend ontimeupdate onvolumechange onwaiting animationend animationiteration animationstart transitionend onerror onmessage onopen onmessage onmousewheel ononline onoffline onpopstate onshow onstorage ontoggle onwheel ontouchcancel ontouchend ontouchmove ontouchstart' );

	// Nuke JS URLs
	this.find( 'a[href*="javascript:"]' ).removeAttr( 'href' );

	// Clean up whitespace
	this.whitespaceClean();

	return this;
};
