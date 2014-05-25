var data = [];

$.getJSON("../test-json.json", function (json) {

	data = json;

	$.each(data, function (key, manga) {
		addMangaToTable(manga, $('#manga_table'));
	});

});

function addMangaToTable(manga, table) {

	table.append('<tr>' +
		'<td class="center-text"><span class="glyphicon glyphicon-eye-open"></span></td>' +
		'<td>' + manga.name + '</td>' +
		'<td class="center-text"><a href="' + manga.urlOfLatestRead + '" title="Continue Reading"><span class="glyphicon glyphicon-play">' + manga.latestRead.replace(/^0+/, '') + '</span></a></td>' +
		'<td class="center-text">' + manga.latest.replace(/^0+/, '') + '</td>' +
		'<td>' + (manga.isTracked ? "Yes" : "No") + '</td>' +
		'<td>' + manga.tags.join(", ") + '</td>' +
		'<td class="center-text">' +
			'<a href="#" title="Read Previous Chapter"><span class="glyphicon glyphicon-backward"></span></a>' +
			'<a href="#" title="Read Next Chapter"><span class="glyphicon glyphicon-forward"></span></a>' +
			'<a href="#" title="Skip to Latest"><span class="glyphicon glyphicon-step-forward"></span></a>' +
		'</td>' +
		'</tr>');

}