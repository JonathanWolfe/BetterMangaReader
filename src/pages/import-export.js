var background = chrome.extension.getBackgroundPage();

chrome.bookmarks.search('BMR Back-up', function (results) {

	console.log('results', results);

	if (results.length > 0) {

		$('#export-data').html(results[0].url.slice(23, -2));

	} else {

		$('#export-data').html('/** No BMR data found! */');

	}
});

$('.go-import').on('click', process_import);

function process_import() {
	if (typeof background.backup === 'function') {

		var data = $('#import-data').val();
		console.log('data:', data);
		
		console.log('Connected to BG page and called update.')
		background.backup(data);

		console.log("storage state:", background.bmr_storage.state);

	} else {

		console.log('Have not connected to BG page yet. Retrying...');
		setTimeout(process_import, 300);

	}
}