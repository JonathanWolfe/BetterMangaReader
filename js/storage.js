var storage = {

	"setDB": function (data) {

		if (!data) {
			console.log('No data supplied');
			return;
		}

		chrome.storage.local.set({
			'bmr': JSON.stringify(data)
		}, storage.getDB);

	},

	"getDB": function () {
		chrome.storage.local.get('bmr', function (data) {
			var temp = JSON.parse(data);

			storage.state = JSON.parse(temp.bmr);
		});
	}

};

module.exports = storage;