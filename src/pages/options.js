var background = chrome.extension.getBackgroundPage(),
	table = $('#manga_table');

(function init() {
	
	console.log(background.bmr_storage.state);
	
	if (background.bmr_storage.state.length > 0) {

		loadMangaTable(background.bmr_storage.state, table);

	} else {

		console.log('No manga to show yet. Will try again.');
		setTimeout(init, 300);

	}
})();

function loadMangaTable(data, table) {

	data.forEach(function (manga) {
		addMangaToTable(manga, table);
	});

	var not_up_to_date = $('tr.danger:not(.disabled)', table).detach(),
		not_tracking = $('tr.disabled', table).detach();

	table.prepend(not_up_to_date).append(not_tracking);

	$('[data-toggle="tooltip"]').tooltip();

}

function addMangaToTable(manga, table) {

	var control_buttons = getControlButtons(manga),
		tracking_button = getTrackingButton(manga);

	table.append('<tr class="' + (manga.latestRead < manga.latest ? "danger" : "success") + (manga.isTracked ? "" : " disabled") + '">' +
		'<td class="mark-read center-text">' + (manga.latestRead < manga.latest ? "<a href=\"#mark-all-read\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"Mark ALL chapters as read\"><span class=\"glyphicon glyphicon-eye-open\"></span></a>" : "") + '</td>' +
		'<td class="manga-name"><strong><em>' + manga.name + '</em></strong></td>' +
		'<td class="latest-read center-text"><a href="' + manga.urlOfLatestRead + '" data-toggle="tooltip" data-placement="right" title="Continue reading from here"><span class="glyphicon glyphicon-play">' + parseFloat(manga.latestRead, 10) + '</span></a></td>' +
		'<td class="latest-chapter center-text">' + parseFloat(manga.latest, 10) + '</td>' +
		'<td class="tracking">' + tracking_button + '</td>' +
		'<td class="tags">' + manga.tags.join(", ") + '</td>' +
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
		'<input type="checkbox" name="onoffswitch' + manga.id + '" id="onoffswitch' + manga.id + '" class="onoffswitch-checkbox" ' + (manga.isTracked ? "checked" : "") + '>' +
		'<label class="onoffswitch-label" for="onoffswitch' + manga.id + '">' +
		'<span class="onoffswitch-inner"></span>' +
		'<span class="onoffswitch-switch"></span>' +
		'</label>' +
		'</div>';

	return buttonHTML;
}

function expandMangaData(mangas) {

	mangas.forEach(function (manga) {

		manga.chapter_list = use_mirror[manga.mirror].getChapterList(manga);

		manga.latest = manga.chapter_list[0][0];

	});

	return mangas;

}

function getChapterURL(chapter, manga) {

	if (chapter === "next") {
		if (parseFloat(manga.latestRead, 10) === parseFloat(manga.chapter_list[0][0], 10)) {
			return manga.urlOfLatestRead;
		} else {
			manga.chapter_list.forEach(function (chapters, index) {
				if (parseFloat(chapters[0], 10) === parseFloat(manga.latest, 10)) {
					return chapter[index + 1][2];
				}
			});
		}
	} else if (chapter === "prev") {
		if (parseFloat(manga.latest, 10) === manga.chapter_list[manga.chapter_list.length - 1][0]) {
			return manga.urlOfLatestRead;
		} else {
			manga.chapter_list.forEach(function (chapters, index) {
				if (parseFloat(chapter[0], 10) === parseFloat(manga.latest, 10)) {
					return chapters[index - 1][2];
				}
			});
		}
	} else if (chapter === "latest") {
		return manga.urlOfLatestRead;
	} else if ($.isNumeric(chapter)) {
		manga.chapter_list.forEach(function (chapters) {
			if (parseFloat(chapter[0], 10) === parseFloat(chapter, 10)) {
				return chapters[2];
			}
		});
	} else {
		return manga.chapter_list[manga.chapter_list.length - 1];
	}

}