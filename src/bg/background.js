function backup(data) {

	console.log("data being back-ed up", data);

	chrome.bookmarks.search('BMR Back-up', function (results) {
		if (results.length > 0) {

			bmr_storage.updateBackup(JSON.stringify(data), results[0]);

		} else {

			bmr_storage.createBackup(JSON.stringify(data));

		}
	});

	bmr_storage.loadState();

}

// bmr_storage.loadExample();
bmr_storage.loadState();

(function backgroundInit() {

	console.log("Storage state", bmr_storage.state);

	if (bmr_storage.state.length > 0) {

		var backup_interval = setInterval(function () {
			backup(bmr_storage.state);
		}, 60000); // every min

	} else {

		console.log('No manga yet. Will try again.');
		var retry = setTimeout(backgroundInit, 300);

	}
})();