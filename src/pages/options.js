var data = [];

$.getJSON("../test-amr-json.json", function (json) {

	data = convertAMRBsync(json);

	$.each(data, function (key, manga) {
		addMangaToTable(manga, $('#manga_table'));
	});
	
	var not_up_to_date = $('#manga_table tr.danger').detach(), not_tracking = $('#manga_table tr.disabled').detach();
	$('#manga_table tbody').prepend(not_up_to_date);
	$('#manga_table tbody').append(not_tracking);
	
	$('[data-toggle="tooltip"]').tooltip();
});

function addMangaToTable(manga, table) {

	var control_buttons = getControlButtons(manga), tracking_button = getTrackingButton(manga);

	table.append('<tr class="' + (manga.latestRead < manga.latest ? "danger" : "success") + (manga.isTracked ? "" : " disabled") + '">' +
					'<td class="mark-read center-text">' + (manga.latestRead < manga.latest ? "<a href=\"#mark-all-read\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"Mark ALL chapters as read\"><span class=\"glyphicon glyphicon-eye-open\"></span></a>" : "") +'</td>' +
					'<td class="manga-name"><strong><em>' + manga.name + '</em></strong></td>' +
					'<td class="latest-read center-text"><a href="' + manga.urlOfLatestRead + '" data-toggle="tooltip" data-placement="right" title="Continue reading from here"><span class="glyphicon glyphicon-play">' + parseFloat(manga.latestRead,10) + '</span></a></td>' +
					'<td class="latest-chapter center-text">' + parseFloat(manga.latest,10) + '</td>' +
					'<td class="tracking">' + tracking_button + '</td>' +
					'<td class="tags">' + manga.tags.join(", ") + '</td>' +
					'<td class="controls">' + control_buttons + '</td>' +
				'</tr>');

}

function getControlButtons(manga) {
	
	var next_chapter = getChapterURL("next", manga), prev_chapter = getChapterURL("prev", manga), latest_chapter = getChapterURL("latest", manga);
	/* 
	var buttonHTML = 
		'<a href="#" title="Read Previous Chapter"><span class="glyphicon glyphicon-backward"></span></a>' +
		'<a href="#" title="Read Next Chapter"><span class="glyphicon glyphicon-forward"></span></a>' +
		'<a href="#" title="Skip to Latest"><span class="glyphicon glyphicon-step-forward"></span></a>';
	*/

	var buttonHTML = 
		'<div class="btn-group">'+
			'<button type="button" class="btn btn-primary" role="button"><a href="'+next_chapter+'">Next Chapter</a></button>'+
			'<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">'+
				'<span class="caret"></span>'+
				'<span class="sr-only">Toggle Dropdown</span>'+
			'</button>'+
			'<ul class="dropdown-menu" role="menu">'+
				'<li><a href="' + prev_chapter +'">Previous Chapter</a></li>'+
				'<li><a href="' + latest_chapter + '">Latest Chapter</a></li>'+
				'<li class="divider"></li>'+
				'<li><a href="#restart">Restart Reading</a></li>'+
			'</ul>'+
		'</div>';
	return buttonHTML;
}

function getTrackingButton(manga) {
	var buttonHTML = 
		'<div class="onoffswitch">'+
			'<input type="checkbox" name="onoffswitch'+ manga.id +'" id="onoffswitch'+ manga.id +'" class="onoffswitch-checkbox" '+ (manga.isTracked ? "checked" : "") +'>'+
			'<label class="onoffswitch-label" for="onoffswitch'+ manga.id +'">'+
				'<span class="onoffswitch-inner"></span>'+
				'<span class="onoffswitch-switch"></span>'+
			'</label>'+
		'</div>';
	
	return buttonHTML;
}

function getChapterURL(chapter, manga) {
	var desired = '';
	switch (true) {
		case chapter === "next":
			desired = '00'+(parseFloat(manga.latestRead, 10) + 1);
			desired.substr(desired.length - 2);
			break;
		case chapter === "prev":
			if (parseFloat(desired, 10) === 0) { desired = "#"; break; }
			desired = '00'+(parseFloat(manga.latestRead, 10) - 1);
			desired.substr(desired.length - 2);
			break;
		case chapter === "latest":
			desired = manga.latest;
			break;
		case $.isNumeric(chapter):
			desired = '00'+chapter;
			desired.substr(desired.length - 2);
			break;
		default:
			desired = '001';
			break;
	}
	return manga.url+'c'+desired;
	
}

function convertAMRBsync(amr) {
	
	var all_converted = [];
	
	$.each(amr.mangas, function(key, manga) {
		
		all_converted[key] = {
			id: key,
			name: manga.name,
			mirror: manga.mirror,
			url: manga.url,
			urlOfLatestRead: manga.lastChapterReadURL,
			isTracked: (manga.display === 0 ? true : false),
			latestRead: (manga.lastChapterReadURL.match(/\/c?([0-9]{1,3})(\.[0-9])?\//))[1],
			latestReadVolume: (manga.lastChapterReadURL.match(/v([0-9]{1,})/) ? manga.lastChapterReadURL.match(/v([0-9]{1,})/)[1] : 0),
			latest: 999,
			latestVolume: 0,
			tags: []
		};
		
		console.log(all_converted[key]);
		
	});
			
	return all_converted;
}