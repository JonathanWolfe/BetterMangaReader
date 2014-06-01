function backup(data) {

	chrome.bookmarks.search('BMR Back-up', function (results) {
		if (results.length > 0) {

			window.bmr_storage.updateBackup(data, results[0]);

		} else {

			window.bmr_storage.createBackup(data);

		}
	});

}

window.bmr_storage.loadExample();

var data = window.bmr_storage.getState();

var backup_interval = window.setInterval(backup(data), 60000); // every min