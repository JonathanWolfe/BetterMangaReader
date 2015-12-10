/*global require, document, chrome */

(function bmr_inject() {
	var $ = require('jquery'),
		mirrors = require('../../js/register-mirrors'),
		url = require('wurl');

	$('body').append('<div class="loading-wrap"><div class="loader"></div><h2>BetterMangaReader Loading...</h2></div>');

	$(document).ready(function () {
		var mirror;

		Object.keys(mirrors).forEach(function (i) {
			if (mirrors[i].mirrorUrl === url('domain', document.location.href)) {
				mirror = mirrors[i];
			}
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
							updateMangaReadChapter: {
								'id': response[1],
								'info': info
							}
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
				$(whereWrite).append('<img src="' + image + '" alt="" id="image-' + index + '" class="BMR-img" />');
			});

			mirror.doAfterMangaLoaded(document);
			$('.loading-wrap').hide();

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
		} else {
			$('.loading-wrap').hide();
		}

	});
})();
