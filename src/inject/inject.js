var readyStateCheckInterval = setInterval(function () {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		var mirror;

		Object.keys(use_mirror).forEach(function (i) {
			if (use_mirror[i].mirrorUrl === url('domain')) mirror = use_mirror[i];
		});

		if (mirror && mirror.isCurrentPageAChapterPage(document)) {

			var chapters = mirror.getChaptersFromPage(document),
				info = mirror.getInformationFromCurrentPage(document);
			
			console.log('info', info);

			mirror.removeRedundant(document);
			mirror.doSomethingBeforeWritingScans(document);

			var pages = mirror.getPages(document),
				whereWrite = mirror.whereDoIWriteScans(document);

			var BMRControls = "<div id='BMRControls'>" +
				"<img src='" + chrome.runtime.getURL('../../icons/icon19.png') + "' alt='BetterMangaRead' />" +
				"<button id='go-prev'>&laquo;</button>" +
				"<form>" +
				"<select>";
			chapters.forEach(function (chapter) {
				var is_current = (parseFloat(chapter[0], 10) === parseFloat(info.currentChapter, 10)) ? ' selected' : '';
				BMRControls += "<option value='" + chapter[2] + "'" + is_current + ">Chapter " + chapter[0] + "</option>";
			});
			BMRControls += "</select>" +
				"</form>" +
				"<button id='go-next'>&raquo;</button>" +
				"</div>";
			$(whereWrite).prepend(BMRControls);

			function updateTrackingButtons() {
				
				$('#BMRControls').append("<button id='check-track' disabled>Checking...</button>");
				
				$('#BMRControls #go-track').remove();
				$('#BMRControls #stop-track').remove();
				
			}
			function checkTracked() {
				chrome.runtime.sendMessage({
					isMangaTracked: info.name
				}, function (response) {
					console.log('check if tracking', response);

					$('#BMRControls #check-track').remove();
					
					if (response[0] === true) {
						$('#BMRControls').append("<button id='stop-track'>Stop Tracking</button>");
						
						chrome.runtime.sendMessage({
							updateMangaReadChapter: {'id': response[1], 'info': info}
						}, function (response) {
							console.log(response);
						});
					} else {
						$('#BMRControls').append("<button id='go-track'>Track Manga</button>");
					}
				});
			}
			updateTrackingButtons();
			checkTracked();

			var chapter_list = $('#BMRControls option'),
				selected_chapter = chapter_list.filter(':selected');

			if (selected_chapter.index() === 0) {
				$('#go-prev').prop('disabled', true);
			}
			if (selected_chapter.index() === chapter_list.length - 1) {
				$('#go-next').prop('disabled', true);
			}

			$('#BMRControls #go-prev:not(:disabled)').on('click', function () {
				var current_index = selected_chapter.index(),
					new_location = chapter_list.eq(current_index - 1).val();
				document.location = new_location;
			});
			$('#BMRControls #go-next:not(:disabled)').on('click', function () {
				var current_index = selected_chapter.index(),
					new_location = chapter_list.eq(current_index + 1).val();
				document.location = new_location;
			});
			$('#BMRControls select').on('change', function () {
				document.location = $('option', this).filter(':selected').val();
			});

			pages.forEach(function (page, index) {
				var image = mirror.getImageFromPage(page);
				$(whereWrite).append('<img src="' + image + '" alt="" id="image-' + index + '"/>');
			});
		}

		mirror.doAfterMangaLoaded(document);

		$('#BMRControls')
			.on('click', '#go-track', function () {
				console.log('attempted to track');
				
				updateTrackingButtons();

				var full_info = {
					"name": info.name,
					"mirror": mirror.mirrorName,
					"url": info.currentMangaURL,
					"urlOfLatestRead": info.currentChapterURL,
					"isTracked": true,
					"latestRead": info.currentChapter,
					"latest": chapters[chapters.length - 1][0],
					"tags": [],
					"chapter_list": chapters
				};

				chrome.runtime.sendMessage({
					mangaToTrack: full_info
				}, function (response) {
					console.log(response);
					
					checkTracked();
				});
			})
			.on('click', '#stop-track', function () {
				console.log('attempting to stop tracking');
				
				updateTrackingButtons();

				chrome.runtime.sendMessage({
					mangaToStopTracking: info.name
				}, function (response) {
					console.log(response);
					
					checkTracked();
				});
			});

	}
}, 10);

var $ = require('jquery'),
	use_mirror = {
		'mangahere': require('../../js/mirrors/mangahere'),
		'mangastream': require('../../js/mirrors/mangastream')
	};

/*! url - v1.8.6 - 2013-11-22 */
window.url = function () {
	function a(a) {
		return !isNaN(parseFloat(a)) && isFinite(a)
	}
	return function (b, c) {
		var d = c || window.location.toString();
		if (!b) return d;
		b = b.toString(), "//" === d.substring(0, 2) ? d = "http:" + d : 1 === d.split("://").length && (d = "http://" + d), c = d.split("/");
		var e = {
				auth: ""
			},
			f = c[2].split("@");
		1 === f.length ? f = f[0].split(":") : (e.auth = f[0], f = f[1].split(":")), e.protocol = c[0], e.hostname = f[0], e.port = f[1] || ("https" === e.protocol.split(":")[0].toLowerCase() ? "443" : "80"), e.pathname = (c.length > 3 ? "/" : "") + c.slice(3, c.length).join("/").split("?")[0].split("#")[0];
		var g = e.pathname;
		"/" === g.charAt(g.length - 1) && (g = g.substring(0, g.length - 1));
		var h = e.hostname,
			i = h.split("."),
			j = g.split("/");
		if ("hostname" === b) return h;
		if ("domain" === b) return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(h) ? h : i.slice(-2).join(".");
		if ("sub" === b) return i.slice(0, i.length - 2).join(".");
		if ("port" === b) return e.port;
		if ("protocol" === b) return e.protocol.split(":")[0];
		if ("auth" === b) return e.auth;
		if ("user" === b) return e.auth.split(":")[0];
		if ("pass" === b) return e.auth.split(":")[1] || "";
		if ("path" === b) return e.pathname;
		if ("." === b.charAt(0)) {
			if (b = b.substring(1), a(b)) return b = parseInt(b, 10), i[0 > b ? i.length + b : b - 1] || ""
		} else {
			if (a(b)) return b = parseInt(b, 10), j[0 > b ? j.length + b : b] || "";
			if ("file" === b) return j.slice(-1)[0];
			if ("filename" === b) return j.slice(-1)[0].split(".")[0];
			if ("fileext" === b) return j.slice(-1)[0].split(".")[1] || "";
			if ("?" === b.charAt(0) || "#" === b.charAt(0)) {
				var k = d,
					l = null;
				if ("?" === b.charAt(0) ? k = (k.split("?")[1] || "").split("#")[0] : "#" === b.charAt(0) && (k = k.split("#")[1] || ""), !b.charAt(1)) return k;
				b = b.substring(1), k = k.split("&");
				for (var m = 0, n = k.length; n > m; m++)
					if (l = k[m].split("="), l[0] === b) return l[1] || "";
				return null
			}
		}
		return ""
	}
}(), "undefined" != typeof jQuery && jQuery.extend({
	url: function (a, b) {
		return window.url(a, b)
	}
});