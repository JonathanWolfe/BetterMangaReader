/*global chrome, $, window */
var background = chrome.extension.getBackgroundPage();

chrome.bookmarks.search('BMR Back-up', function (results) {

	console.log('results', results);

	if (results.length > 0) {

		$('#export-data').html(results[0].url.slice(23, -2));

	} else {

		$('#export-data').html('/** No BMR data found! */');

	}
});

chrome.bookmarks.search('All Mangas Reader', function (results) {
	console.log('AMR Bookmark', results);

	if (results.length > 0) {
		$('.go-import').parent()
			.append('<button class="btn btn-lg go-import-amr col-sm-12 col-md-12">Import &amp; Convert Your AllMangaReader Data?</button>')
			.on('click', '.go-import-amr', function () {
				var content = results[0].url.substr(17);
				content = content.substr(0, content.lastIndexOf('}') + 1);
				
				console.log(content);
				
				var converted = window.amr_converter(content);
				
				$('#import-data').val(JSON.stringify(converted));
			});
	}

});

$('.go-import').on('click', process_import);

function process_import() {
	if (typeof background.backup === 'function') {

		var data = JSON.parse($('#import-data').val());

		console.log('Connected to BG page and called update.');
		background.backup(data);

		console.log("storage state:", background.bmr_storage.state);

	} else {

		console.log('Have not connected to BG page yet. Retrying...');
		window.setTimeout(process_import, 300);

	}
}