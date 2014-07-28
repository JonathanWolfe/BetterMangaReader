var readyStateCheckInterval = setInterval(function () {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		
		var mirror, info;
		
		Object.keys(use_mirror).forEach(function(i){
			if(use_mirror[i].mirrorUrl === url('domain')) mirror = use_mirror[i];
		});
		
		if(mirror && mirror.isCurrentPageAChapterPage(document)){
			
			var chapters = mirror.getChaptersFromPage(document);
			
			info = mirror.getInformationFromCurrentPage(document);
			
			mirror.removeRedundant(document);
			
			var pages = mirror.getPages(document),
				images = mirror.getImageFromPages(pages);
			
			mirror.doSomethingBeforeWritingScans(document);
			images.forEach(function(image, index){
				$(mirror.whereDoIWriteScans(document)).append('<img src="'+image+'" alt="" id="image-'+index+'"/>');
			});
		}
		console.log('mirror', mirror);
		console.log('info', info);
		
		chrome.runtime.sendMessage({'mirrorName': mirror, pageInfo: info}, function(response) {
			console.log(response);
		});

	}
}, 10);

var $ = require('jquery'),
	use_mirror = {
		'mangahere': require('../../js/mirrors/mangahere'),
		'mangastream': require('../../js/mirrors/mangastream')
	};

/*! url - v1.8.6 - 2013-11-22 */
window.url=function(){function a(a){return!isNaN(parseFloat(a))&&isFinite(a)}return function(b,c){var d=c||window.location.toString();if(!b)return d;b=b.toString(),"//"===d.substring(0,2)?d="http:"+d:1===d.split("://").length&&(d="http://"+d),c=d.split("/");var e={auth:""},f=c[2].split("@");1===f.length?f=f[0].split(":"):(e.auth=f[0],f=f[1].split(":")),e.protocol=c[0],e.hostname=f[0],e.port=f[1]||("https"===e.protocol.split(":")[0].toLowerCase()?"443":"80"),e.pathname=(c.length>3?"/":"")+c.slice(3,c.length).join("/").split("?")[0].split("#")[0];var g=e.pathname;"/"===g.charAt(g.length-1)&&(g=g.substring(0,g.length-1));var h=e.hostname,i=h.split("."),j=g.split("/");if("hostname"===b)return h;if("domain"===b)return/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(h)?h:i.slice(-2).join(".");if("sub"===b)return i.slice(0,i.length-2).join(".");if("port"===b)return e.port;if("protocol"===b)return e.protocol.split(":")[0];if("auth"===b)return e.auth;if("user"===b)return e.auth.split(":")[0];if("pass"===b)return e.auth.split(":")[1]||"";if("path"===b)return e.pathname;if("."===b.charAt(0)){if(b=b.substring(1),a(b))return b=parseInt(b,10),i[0>b?i.length+b:b-1]||""}else{if(a(b))return b=parseInt(b,10),j[0>b?j.length+b:b]||"";if("file"===b)return j.slice(-1)[0];if("filename"===b)return j.slice(-1)[0].split(".")[0];if("fileext"===b)return j.slice(-1)[0].split(".")[1]||"";if("?"===b.charAt(0)||"#"===b.charAt(0)){var k=d,l=null;if("?"===b.charAt(0)?k=(k.split("?")[1]||"").split("#")[0]:"#"===b.charAt(0)&&(k=k.split("#")[1]||""),!b.charAt(1))return k;b=b.substring(1),k=k.split("&");for(var m=0,n=k.length;n>m;m++)if(l=k[m].split("="),l[0]===b)return l[1]||"";return null}}return""}}(),"undefined"!=typeof jQuery&&jQuery.extend({url:function(a,b){return window.url(a,b)}});