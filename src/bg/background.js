function backup(data) {

	chrome.bookmarks.search('BMR Back-up', function (results) {
		if (results.length > 0) {

			bmr_storage.updateBackup(data, results[0]);

		} else {

			bmr_storage.createBackup(data);

		}
	});

}

// bmr_storage.loadExample();
bmr_storage.loadState();

(function backgroundInit() {
	
	console.log(bmr_storage.state);
	
	if (bmr_storage.state.length > 0) {

		var backup_interval = setInterval(backup(bmr_storage.state), 60000); // every min

	} else {

		console.log('No manga yet. Will try again.');
		setTimeout(backgroundInit, 300);

	}
})();
