var Mirror = {

	mirrorName: "MangaStream",
	mirrorUrl: "readms.com",
	languages: "en",

	// Gets the chapter list from inside a manga
	getChaptersFromPage: function (page) {
		var chapters = [];

		$('.controls .btn-group:first li a:not(":last")', page).each(function () {
			var chapter_num = $('.visible-phone', this).text().trim(),
				chapter_name = $('.visible-desktop', this).text().trim();
			chapters.push([chapter_num, chapter_name, $(this).attr('href')]);
		});

		chapters.reverse();

		return chapters;
	},

	/**
	 *  Find the list of all chapters of the manga represented by the urlManga parameter
	 *  This list must be an Array of [["chapter Number", "chapter name", "url"], ...]
	 *  This list must be sorted descending. The first element must be the most recent.
	 */
	getChapterList: function (manga) {
		var encodedURL = encodeURIComponent(manga.url),
			chapter_data = [];

		$.ajax({
			async: false,
			url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22"
		})
			.done(function (returned_data) {

				$(returned_data).find(".table-striped a").each(function () {
					var chapter_name = $(this).text().trim(),
						chapter_num = /([0-9]+(?:\.[0-9])?) /.exec(chapter_name);

					chapter_data.push([chapter_num, chapter_name, $(this).attr("href")]);
				});

			});

		// console.log(manga);
		// console.log(chapter_data);
		return chapter_data;
	},

	/**
	 *  This method must return (throught callback method) an object like :
	 *  {"name" : Name of current manga,
	 *  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
	 *  "currentMangaURL": Url to access current manga,
	 *  "currentChapterURL": Url to access current chapter}
	 */
	getInformationFromCurrentPage: function (page) {
		var name = $('.dropdown-toggle .visible-desktop:first', page).text().trim(),
			currentChapter = $('.btn-group .dropdown-toggle:first', page).text().replace(name, '').trim(),
			currentMangaURL = $('.btn-group .dropdown-menu:first a:last', page).attr('href'),
			currentChapterURL = $('.dropdown-menu:last a:first', page).attr('href');

		return {
			"name": name,
			"currentChapter": currentChapter.slice(0, currentChapter.indexOf(' - ') - 1),
			"currentMangaURL": currentMangaURL,
			"currentChapterURL": currentChapterURL
		};
	},

	// Returns the list of the pages in this chapter to be used later when making the image urls.
	getPages: function (page) {

		var pages = [],
			last_page = $('.dropdown-menu:last li:last a', page).attr('href'),
			num_pages = last_page.split('/').pop();

		for (var i = 1; i <= num_pages; i += 1) {
			pages.push(last_page.substr(0, last_page.length - num_pages.length) + i);
		}

		return pages;
	},

	//Remove the banners from the current page
	removeRedundant: function (page) {
		$('.banner-ad', page).remove();
		$('#reader-sky', page).remove();
	},

	/**
	 *  This method returns the place to write the full chapter in the document
	 *  The returned element will be totally emptied.
	 */
	whereDoIWriteScans: function (page) {
		return $(".page", page);
	},

	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage: function (page) {
		return ($(".page", page).size() > 0);
	},

	//This method is called before displaying full chapters in the page
	doSomethingBeforeWritingScans: function (page) {
		$(".page", page).empty();
		$(".page", page).css("width", "auto");
		$(".subnav", page).hide();
	},

	// Write the image from the the url returned by the getPages() function.
	getImageFromPage: function (page) {
		var src;

		$.ajax(page, {
			async: false,
			success: function (data) {
				src = $(".page img", data).attr("src");
			}
		});

		return src;
	},

	//This function is called when the manga is full loaded. Just do what you want here...
	doAfterMangaLoaded: function (page) {
		//This function runs in the DOM of the current consulted page.
		$("body > div:empty", page).remove();
	}
};

module.exports = Mirror;