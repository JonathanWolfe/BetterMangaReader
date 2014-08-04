var background = chrome.extension.getBackgroundPage();

chrome.bookmarks.search('BMR Back-up', function (results) {

	console.log('results', results);

	if (results.length > 0) {

		$('#export-data').html(results[0].url.slice(23, -2));

	} else {

		$('#export-data').html('/** No BMR data found! */');

	}
});

chrome.bookmarks.search('All Manga Reader', function (results) {
	console.log('AMR Bookmark', results);

	if (results.length > 0) {
		$('.go-import').parent()
			.append('<button class="btn btn-lg go-import-amr col-sm-12 col-md-12">Import &amp; Convert Your AllMangaReader Data?</button>')
			.on('click', '.go-import-amr', function () {
				chrome.runtime.sendMessage({
					'runAmrConverter': true
				}, function (response) {
					console.log(response);
				});
			});
	}

});

$('.go-import').on('click', process_import);

function process_import() {
	if (typeof background.backup === 'function') {

		var data = $('#import-data').val();
		console.log('data:', data);

		console.log('Connected to BG page and called update.')
		//background.backup(data);

		console.log("storage state:", background.bmr_storage.state);

	} else {

		console.log('Have not connected to BG page yet. Retrying...');
		setTimeout(process_import, 300);

	}
}