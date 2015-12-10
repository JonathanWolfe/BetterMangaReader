/*global chrome, $, window */
var background = chrome.extension.getBackgroundPage();

chrome.bookmarks.search('BMR Back-up', function (results) {

	console.log('results', results);

	if (results.length) {

		$('#export-data').html(results[0].url.slice(23, -2));

	} else {

		$('#export-data').html('/** No BMR data found! */');

	}
});

chrome.bookmarks.search('All Mangas Reader', function (results) {
	console.log('AMR Bookmark', results);

	if (results.length > 0) {
		$('.go-import').parent()
			.append('<button class="btn btn-lg go-import-amr col-sm-12 col-md-12">Import &amp; Convert Your AllMangaReader sync bookmark?</button>')
			.on('click', '.go-import-amr', function () {
				convert_amr(results[0].url)
			});
	}

});

$('#amrimport + .btn').on('click', function () {
	convert_amr($('#amrimport').val())
});

$('.go-import').on('click', process_import);

function process_import() {

	if (typeof background.bmr_storage.backup === 'function') {
		var data = JSON.parse($('#import-data').val());

		console.log('Connected to BG page and called update.');
		background.bmr_storage.backup(data);

		console.log("storage state:", background.bmr_storage.state);

		window.location.assign('index.html');

	} else {
		console.log('Have not connected to BG page yet. Retrying...');
		window.setTimeout(process_import, 300);
	}
}

function convert_amr(data) {
	var content = data.substr(data.indexOf('{'));
	content = content.substr(0, content.lastIndexOf('}') + 1);

	console.log('amr converted content', content);

	var converted = window.amr_converter(content);

	background.bmr_storage.backup(converted);

	window.location.assign('index.html');
}