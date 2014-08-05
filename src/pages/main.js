/*global chrome, $, window */

var background = chrome.extension.getBackgroundPage(),
	table = $('#manga_table');

(function init() {

	console.log("storage state", background.bmr_storage.state);

	if (background.bmr_storage.state.length > 0) {

		loadMangaTable(background.bmr_storage.state, table);

	} else {

		console.log('No manga to show yet. Will try again.');
		window.setTimeout(init, 300);

	}

	$('.refresh-btn').on('click', function () {

		$('.loading-wrap').show();

		window.setTimeout(function () {
			var updated = background.bmr_storage.expandMangaData(background.bmr_storage.state);
			console.log('updated mangas', updated);

			background.backup(updated);

			loadMangaTable(updated, table);
		}, 200);
	});

	$('.tracking').on('click', 'label', function () {
		var clicked_manga_name = $(this).parentsUntil('tbody').find('.manga-name').text(),
			clicked_is_tracked = $(this).prev().prop('checked');

		console.log('Clicked Manga Name:', clicked_manga_name);
		console.log('Clicked Manga is tracked:', clicked_is_tracked);

		if (clicked_is_tracked) {
			chrome.runtime.sendMessage({
				mangaToStopTracking: clicked_manga_name
			}, function (response) {
				console.log(response);
			});
		} else {
			chrome.runtime.sendMessage({
				mangaToTrack: {
					'name': clicked_manga_name
				}
			}, function (response) {
				console.log(response);
			});
		}

	});

	$('.mark-read').on('click', 'a', function (e) {
		e.preventDefault();

		var clicked_manga_name = $(this).parentsUntil('tbody').find('.manga-name').text();

		console.log('Clicked Manga Name:', clicked_manga_name);

		chrome.runtime.sendMessage({
			markMangaAsRead: clicked_manga_name
		}, function (response) {
			console.log(response);
			window.location.reload();
		});
	});

	$('.controls').on('click', 'a:last', function (e) {
		e.preventDefault();

		var clicked_manga_name = $(this).parentsUntil('tbody').find('.manga-name').text();

		console.log(clicked_manga_name);

		chrome.runtime.sendMessage({
			resetMangaReading: clicked_manga_name
		}, function (response) {
			console.log(response);
			window.location.reload();
		});
	});

	chrome.runtime.onMessage.addListener(function (request) {
		console.log('request recieved', request);
		if (request.expandingMangas !== undefined) {
			$('.loading-wrap').show();
		}
		if (request.expandingMangasDone !== undefined) {
			window.location.reload();
		}
	});
})();

function loadMangaTable(data, table) {

	table.find('tbody').html('');

	data.forEach(function (manga) {
		addMangaToTable(manga, table);
	});

	var not_up_to_date = $('tr.danger:not(.disabled)', table).detach(),
		not_tracking = $('tr.disabled', table).detach();

	table.prepend(not_up_to_date).append(not_tracking);

	$('[data-toggle="tooltip"]').tooltip();

	$('.loading-wrap').hide();

}

function addMangaToTable(manga, table) {

	var control_buttons = getControlButtons(manga),
		tracking_button = getTrackingButton(manga);

	table.append('<tr class="' + (parseFloat(manga.latestRead, 10) < parseFloat(manga.latest, 10) ? "danger" : "success") + (manga.isTracked ? "" : " disabled") + '">' +
		'<td class="mark-read center-text">' + (parseFloat(manga.latestRead, 10) < parseFloat(manga.latest, 10) ? "<a href=\"#mark-all-read\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"Mark ALL chapters as read\"><span class=\"glyphicon glyphicon-eye-open\"></span></a>" : "") + '</td>' +
		'<td class="manga-name"><strong><em>' + manga.name + '</em></strong></td>' +
		'<td class="latest-read center-text"><a href="' + manga.urlOfLatestRead + '" data-toggle="tooltip" data-placement="right" title="Continue reading from here"><span class="glyphicon glyphicon-play">' + parseFloat(manga.latestRead, 10) + '</span></a></td>' +
		'<td class="latest-chapter center-text">' + parseFloat(manga.latest, 10) + '</td>' +
		'<td class="tracking">' + tracking_button + '</td>' +
		'<td class="controls">' + control_buttons + '</td>' +
		'</tr>');
}

function getControlButtons(manga) {

	var next_chapter = getChapterURL("next", manga),
		prev_chapter = getChapterURL("prev", manga),
		latest_chapter = getChapterURL("latest", manga),
		buttonHTML =
		'<div class="btn-group">' +
		'<button type="button" class="btn btn-primary" role="button"><a href="' + next_chapter + '">Next Chapter</a></button>' +
		'<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">' +
		'<span class="caret"></span>' +
		'<span class="sr-only">Toggle Dropdown</span>' +
		'</button>' +
		'<ul class="dropdown-menu" role="menu">' +
		'<li><a href="' + prev_chapter + '">Previous Chapter</a></li>' +
		'<li><a href="' + latest_chapter + '">Latest Chapter</a></li>' +
		'<li class="divider"></li>' +
		'<li><a href="#restart">Restart Reading</a></li>' +
		'</ul>' +
		'</div>';

	return buttonHTML;
}

function getTrackingButton(manga) {
	var buttonHTML =
		'<div class="onoffswitch">' +
		'<input type="checkbox" name="onoffswitch-' + manga.id + '" id="onoffswitch-' + manga.id + '" class="onoffswitch-checkbox" ' + (manga.isTracked ? "checked" : "") + '>' +
		'<label class="onoffswitch-label" for="onoffswitch-' + manga.id + '">' +
		'<span class="onoffswitch-inner"></span>' +
		'<span class="onoffswitch-switch"></span>' +
		'</label>' +
		'</div>';

	return buttonHTML;
}

function getChapterURL(key, manga) {

	var found,
		list = manga.chapter_list;

	if (key === "next") {

		if (parseFloat(manga.latestRead, 10) === parseFloat(manga.latest, 10)) {

			return manga.urlOfLatestRead;

		} else {

			list.forEach(function (chapter, index) {

				if (parseFloat(chapter[0], 10) === parseFloat(manga.latestRead, 10)) {

					found = index;

				}

			});

			if (found === undefined) {
				return manga.urlOfLatestRead;
			} else {
				return list[found - 1][2];
			}

		}

	} else if (key === "prev") {

		if (parseFloat(manga.latestRead, 10) === parseFloat(list[list.length - 1][0], 10)) {

			return manga.urlOfLatestRead;

		} else {

			list.forEach(function (chapter, index) {

				if (parseFloat(chapter[0], 10) === parseFloat(manga.latestRead, 10)) {

					found = index;

				}

			});

			if (found === undefined) {
				return manga.urlOfLatestRead;
			} else {
				return list[found + 1][2];
			}

		}
	} else if (key === "latest") {

		return list[0][2];

	} else {

		return manga.urlOfLatestRead;

	}

}