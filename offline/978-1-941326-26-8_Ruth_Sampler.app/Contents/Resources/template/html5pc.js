var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
var CData = function() {
};
CData.__name__ = true;
CData.prototype = {
	__class__: CData
}
var FlipBook = function() {
	this.isMoveNote = false;
	this.currentOrgY = 0;
	this.currentOrgX = 0;
	this.moveDY = 0;
	this.moveDX = 0;
	this.zoomLevel = 1;
	this.zoomCSS = "";
	this.bAbortMouseDown = false;
	this.bCanGestureZoom = true;
	this.bStartNoteGesture = false;
	this.currentNote = null;
	this.bStartNote = false;
	this.bStartHighLightGesture = false;
	this.currentHighLight = null;
	this.bStartHighLight = false;
	this.gestureLastY = -1;
	this.gestureLastX = -1;
	this.gestureMoveY = 0;
	this.gestureMoveX = 0;
	this.currentMoveY = 0;
	this.currentMoveX = 0;
	this.init_moveY = 0;
	this.init_moveX = 0;
	this.totalLast = 0;
	this.totalDistance = 0;
	this.last_moveY = 0;
	this.last_moveX = 0;
	this.page_offsetY = 0;
	this.page_offsetX = 0;
	this.realScale = 1;
	this.totalGeustureScale = 0;
	this.gestureScale = 1;
	this.startMoveGesture = false;
	this.startFingerDistance = 0;
	this.startZoomGesture = false;
	this.rightPageNum = -1;
	this.leftPageNum = -1;
	this.bookContext = new core.BookContext();
	this.tweener = new core.Tweener();
	this.currentPageNum = 0;
	this.zoomStatus = core.ZoomStatus.normal;
	this.zoomCSS = "position:absolute;left:0px;top:0px;width:100%;height:100%;overflow: hide;" + "-webkit-tap-highlight-color: rgba(255, 255, 255, 0);" + "-webkit-user-select: none;";
};
FlipBook.__name__ = true;
FlipBook.prototype = {
	f_sort: function(x,y) {
		if(x.pageNum > y.pageNum) return 1;
		if(x.pageNum == y.pageNum) return 0;
		return -1;
	}
	,onButtonBookmark: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnBookMark) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("bookmarks");
		this.setTopTitle("BookmarkView");
		this.currentTopBarButton = this.btnBookMark;
		var bookmarks = RunTime.book.bookmarks;
		var lv = !this.checkIfExistBookmark(this.leftPageNum) && this.leftPageNum != -1;
		var rv = !this.checkIfExistBookmark(this.rightPageNum) && this.rightPageNum != -1;
		bookmarks.sort($bind(this,this.f_sort));
		var html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,lv,rv);
		if(RunTime.book.rightToLeft) html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,rv,lv);
		this.topBarContent.innerHTML = html;
		this.topBarContent.style.display = "block";
		this.HideBarOnPhone();
	}
	,resetHighlightButton: function() {
		this.bStartHighLight = false;
		this.btnMask.style.backgroundColor = "";
	}
	,onAboutUsClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnAboutUs) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("about");
		this.currentTopBarButton = this.btnAboutUs;
		this.setTopTitle("AboutUs");
		if(RunTime.contentInfo != null) {
			var html = core.HtmlHelper.toAboutHtml(RunTime.aboutInfo,RunTime.bookInfo);
			this.topBarContent.innerHTML = html;
			this.topBarContent.style.display = "block";
		}
		this.HideBarOnPhone();
	}
	,resetNoteButton: function() {
		this.bStartNote = false;
		this.btnNote.style.backgroundColor = "";
	}
	,onButtonNoteClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.resetHighlightButton();
		this.bStartNote = !this.bStartNote;
		if(this.bStartNote) this.btnNote.style.backgroundColor = "#ff00ff"; else this.btnNote.style.backgroundColor = "";
		this.HideBarOnPhone();
	}
	,onButtonMaskClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		if(e != null) {
			e.preventDefault();
			e.stopPropagation();
			this.bStartHighLight = !this.bStartHighLight;
		} else this.bStartHighLight = false;
		this.resetNoteButton();
		if(this.bStartHighLight) this.btnMask.style.backgroundColor = "#ff00ff"; else this.btnMask.style.backgroundColor = "";
		this.HideBarOnPhone();
	}
	,resetZoom: function() {
		this.startZoomGesture = false;
		this.startFingerDistance = 0;
		this.startMoveGesture = false;
		this.page_offsetX = 0;
		this.page_offsetY = 0;
		this.last_moveX = 0;
		this.last_moveY = 0;
		this.init_moveX = 0;
		this.init_moveY = 0;
	}
	,updateVideoLayout: function() {
		var list = this.findVideoHtmlDoms();
		var videos = new Array();
		var _g1 = 0, _g = list.length;
		while(_g1 < _g) {
			var i = _g1++;
			var dom = list[i];
			var _g3 = 0, _g2 = RunTime.book.videos.length;
			while(_g3 < _g2) {
				var j = _g3++;
				var video = RunTime.book.videos[j];
				if(video.id == dom.id) video.updateLayout(dom);
			}
		}
	}
	,findVideoHtmlDoms: function() {
		var list = new Array();
		if(this.cvsVideo != null) {
			var c = this.cvsVideo.childNodes;
			var _g1 = 0, _g = c.length;
			while(_g1 < _g) {
				var i = _g1++;
				list.push(c[i]);
			}
		}
		return list;
	}
	,hackHtmlDom: function(item) {
		item.onclick = $bind(this,this.forbidden);
		item.ontouchstart = $bind(this,this.forbidden);
		item.ontouchmove = $bind(this,this.forbidden);
		item.ontouchend = $bind(this,this.forbidden);
		item.ontouchcancel = $bind(this,this.forbidden);
		item.gestureend = $bind(this,this.forbidden);
		item.gesturestart = $bind(this,this.forbidden);
		item.gesturechange = $bind(this,this.forbidden);
		item.onscroll = $bind(this,this.forbidden);
		item.onmousewheel = $bind(this,this.forbidden);
		item.ondblclick = $bind(this,this.forbidden);
	}
	,attachVideoTouchEvents: function() {
		var list = this.findVideoHtmlDoms();
		var _g1 = 0, _g = list.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = list[i];
		}
	}
	,showPopupAudio: function(item) {
		item.url = item.destination;
		var pageNum = item.pageNum;
		var audio = new core.AudioInfo();
		audio.pageNum = pageNum;
		audio.url = item.destination;
		this.cvsLeftPageBgAudio.innerHTML = "";
		this.cvsLeftPageBgAudio.innerHTML = core.HtmlHelper.toPopupPageAudiosHtml(audio,true);
		var item1 = js.Lib.document.getElementById("cvsLeftPageBgAudio").getElementsByTagName("audio")[0];
		item1.play();
	}
	,loadCtxNotes: function() {
		var notes = new Array();
		if(RunTime.book != null && RunTime.book.notes != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.notes.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.notes[i];
				if(item.pageNum == current) notes.push(item);
			}
		}
		this.bookContext.notes = notes;
	}
	,loadCtxHighLights: function() {
		var highlights = new Array();
		if(RunTime.book != null && RunTime.book.highlights != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.highlights.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.highlights[i];
				if(item.pageNum == current) highlights.push(item);
			}
		}
		this.bookContext.highlights = highlights;
	}
	,loadCtxButtons: function() {
		var buttons = new Array();
		if(RunTime.book != null && RunTime.book.buttons != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.buttons.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.buttons[i];
				if(item.pageNum == current) buttons.push(item); else if(item.layer == "foreground") buttons.push(item);
			}
		}
		this.bookContext.buttons = buttons;
	}
	,updateAudios: function() {
		var audios = this.getCurrentPageAudios();
		if(audios.left != null || audios.right != null) {
			this.cvsLeftPageBgAudio.innerHTML = core.HtmlHelper.toPopupPageAudiosHtml(audios.left,true);
			this.cvsRightPageBgAudio.innerHTML = core.HtmlHelper.toPopupPageAudiosHtml(audios.right,false);
		} else RunTime.clearBgAudio();
	}
	,renderVideo: function(item) {
		this.cvsVideo.innerHTML += core.HtmlHelper.toVideoHtml(item);
	}
	,updateVideos: function() {
		this.loadCtxVideos();
		var videos = this.bookContext.videos;
		if(videos != null) {
			var _g1 = 0, _g = videos.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = videos[i];
				this.renderVideo(item);
			}
		}
		this.attachVideoTouchEvents();
	}
	,clearVideos: function() {
		this.cvsVideo.innerHTML = "";
	}
	,renderSlideshow: function(item) {
		this.cvsSlideshow.innerHTML += core.HtmlHelper.toSlideshow(item);
	}
	,updateSlideshow: function() {
		var slides = this.bookContext.slideshow;
		if(slides != null) {
			var _g1 = 0, _g = slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = slides[i];
				this.renderSlideshow(item);
				item.startTweener();
			}
		}
	}
	,clearSlideshow: function() {
		this.cvsSlideshow.innerHTML = "";
		var slides = this.bookContext.slideshow;
		if(slides != null) {
			var _g1 = 0, _g = slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = slides[i];
				item.stopTweener();
			}
		}
	}
	,hideBottomBar: function(e,animate,atOnce) {
		if(atOnce == null) atOnce = false;
		if(animate == null) animate = true;
		if(e != null) {
			var t = e.target;
			if(t == this.btnAutoFlip || t == this.btnContents || t == this.btnFirstPage || t == this.btnLastPage || t == this.btnNextPage || t == this.btnPrevPage || t == this.btnSearch || t == this.btnThumbs || t == this.tbPage || t == this.imgLogo) return;
		}
		if(atOnce) {
			this.topMenuBarBg.style.cssText = "opacity:0 ; ";
			this.bottomBar.style.cssText = "opacity: 0 ;";
		} else {
			this.topMenuBarBg.style.cssText = "opacity:0 ; -webkit-transition: 0.3s ease-out; ";
			this.bottomBar.style.cssText = "opacity: 0 ; -webkit-transition: 0.3s ease-out; ";
			this.bCanGestureZoom = false;
		}
		RunTime.saveBottomBarVisible(false);
	}
	,showBottomBar: function(e) {
		this.topMenuBarBg.style.cssText = "opacity:" + RunTime.bottomBarAlpha + ";  -webkit-transition: 0.3s ease-out; ";
		this.topMenuBar.style.display = "inline-block";
		this.bottomBar.style.cssText = "opacity:" + 1 + "; -webkit-transition: 0.3s ease-out; ";
		this.bottomBar.style.display = "inline-block";
		this.bCanGestureZoom = false;
		RunTime.setTopMenuBarVisible();
		RunTime.saveBottomBarVisible(true);
	}
	,getCurrentBBV: function() {
		if(this.bottomBar.style.display == "inline-block") return "1"; else return "0";
	}
	,getCurrentPageAudios: function() {
		var audios = RunTime.book.audios;
		var match = { left : null, right : null};
		var pg = this.getCurrentPageNum();
		var _g1 = 0, _g = audios.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = audios[i];
			if(item.pageNum == pg) match.left = item;
		}
		return match;
	}
	,getFullText: function(pages) {
		var result = "";
		var pg = this.getCurrentPageNum();
		var _g1 = 0, _g = pages.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = pages[i];
			if(item.num == pg) {
				result += "<br />";
				result += "<br />";
				result += "==== Page " + Std.string(pg + 1) + " ====";
				result += "<br />";
				result += "<br />";
				result += item.content;
				result += "<br />";
				result += "<br />";
				break;
			}
		}
		result = StringTools.replace(result,"\n","<br />");
		return result;
	}
	,updateFullTextCore: function(pages) {
		var result = this.getFullText(pages);
		this.topFullTextContent.innerHTML = result;
		this.topFullTextContent.scrollTop = 0;
	}
	,updateFullText: function() {
		RunTime.invokePageContentsAction($bind(this,this.updateFullTextCore));
	}
	,showTxtCore: function(pages) {
		var result = this.getFullText(pages);
		this.resetAndShowTopBar("text");
		this.setTopTitle("FullText");
		this.currentTopBarButton = this.btnShowTxt;
		this.topFullTextContent.innerHTML = result;
		this.topFullTextContent.scrollTop = 0;
	}
	,onShowTxtClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnShowTxt) {
			this.hideTopBar();
			return;
		}
		this.HideBarOnPhone();
		RunTime.invokePageContentsAction($bind(this,this.showTxtCore));
	}
	,onZoomClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.zoomAt(null,null);
	}
	,onAutoFlipClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		if(this.zoomLeftPage.src != "") {
			this.zoomLeftPage.src = "";
			this.zoomLeftPage.style.display = "none";
		}
		if(this.zoomRightPage.src != "") {
			this.zoomRightPage.src = "";
			this.zoomRightPage.style.display = "none";
		}
		this.stopFlip(false);
		this.hideTopBar();
		if(this.isAutoFliping == true) {
			this.isAutoFliping = false;
			this.btnAutoFlip.style.opacity = 1;
		} else {
			this.isAutoFliping = true;
			this.btnAutoFlip.style.opacity = RunTime.autoflipButtonUnselectedAlpha;
			this.flipTweener = new core.Tweener();
			var self = this;
			var countOfClip = 50 * RunTime.book.autoFlipSecond;
			this.flipTweener.onChange = function(count) {
				if(count % countOfClip != 0) return;
				if(self.isAutoFliping == false) return;
				if(self.canTurnRight() == true) {
					if(RunTime.book.rightToLeft) self.turnPage(-1); else self.turnPage(1);
				} else self.stopFlip();
			};
			this.flipTweener.start(1000000);
		}
	}
	,canTurnRight: function() {
		var num = this.getCurrentPageNum();
		return num < RunTime.book.pages.length - 1;
	}
	,preloadPages: function(num) {
		if(RunTime.enablePreload == false) return;
		RunTime.book.preloadPages(num);
	}
	,stopFlip: function(resetFlipFlag) {
		if(resetFlipFlag == null) resetFlipFlag = true;
		if(this.flipTweener != null) {
			this.flipTweener.onChange = null;
			this.flipTweener.stop();
			this.flipTweener = null;
		}
		if(resetFlipFlag == true) {
			this.isAutoFliping = false;
			this.btnAutoFlip.style.opacity = 1;
		}
	}
	,checkIfExistBookmark: function(pageNum) {
		var i = 0;
		var _g1 = 0, _g = RunTime.book.bookmarks.length;
		while(_g1 < _g) {
			var i1 = _g1++;
			if(pageNum == RunTime.book.bookmarks[i1].pageNum) return true;
		}
		return false;
	}
	,loadCurrentBookmark: function() {
		var bms = new Array();
		if(RunTime.book != null && RunTime.book.bookmarks != null) {
			var _g1 = 0, _g = RunTime.book.bookmarks.length;
			while(_g1 < _g) {
				var i = _g1++;
				var bm = RunTime.book.bookmarks[i];
				if(bm.pageNum == this.currentPageNum + 1) bms.push(bm);
			}
		}
		this.bookContext.bookmarks = bms;
	}
	,addBookmark: function(layout,text) {
		if(layout == null) layout = 0;
		var bookmark = new core.Bookmark();
		if(layout == -1) {
			if(RunTime.book.rightToLeft) bookmark.pageNum = this.rightPageNum; else bookmark.pageNum = this.leftPageNum;
		} else if(layout == 1) {
			if(RunTime.book.rightToLeft) bookmark.pageNum = this.leftPageNum; else bookmark.pageNum = this.rightPageNum;
		} else if(layout == 0) bookmark.pageNum = this.getCurrentPageNum() + 1;
		bookmark.text = text;
		bookmark.save();
		RunTime.book.bookmarks.push(bookmark.clone());
		var bookmarks = RunTime.book.bookmarks;
		var lv = !this.checkIfExistBookmark(this.leftPageNum) && this.leftPageNum != -1;
		var rv = !this.checkIfExistBookmark(this.rightPageNum) && this.rightPageNum != -1;
		var html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,lv,rv);
		if(RunTime.book.rightToLeft) html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,rv,lv);
		this.topBarContent.innerHTML = html;
	}
	,removeBookmark: function(pageNum) {
		var i = 0;
		var tmp = new Array();
		var currentBookmark = null;
		var _g1 = 0, _g = RunTime.book.bookmarks.length;
		while(_g1 < _g) {
			var i1 = _g1++;
			haxe.Log.trace(RunTime.book.bookmarks[i1].pageNum,{ fileName : "FlipBook.hx", lineNumber : 2160, className : "FlipBook", methodName : "removeBookmark"});
			if(pageNum + 1 != RunTime.book.bookmarks[i1].pageNum) tmp.push(RunTime.book.bookmarks[i1]); else currentBookmark = RunTime.book.bookmarks[i1];
		}
		if(currentBookmark != null) currentBookmark.remove();
		RunTime.book.bookmarks = tmp;
		var bookmarks = RunTime.book.bookmarks;
		var lv = !this.checkIfExistBookmark(this.leftPageNum) && this.leftPageNum != -1;
		var rv = !this.checkIfExistBookmark(this.rightPageNum) && this.rightPageNum != -1;
		var html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,lv,rv);
		if(RunTime.book.rightToLeft) html = core.HtmlHelper.toBookmarksHtml(bookmarks,RunTime.singlePage,rv,lv);
		this.topBarContent.innerHTML = html;
	}
	,getCurrentPageNum: function() {
		var num = 0;
		if(this.currentPageNum != null) num = this.currentPageNum;
		return num;
	}
	,searchInPages: function(pages) {
		var results = [];
		var _g1 = 0, _g = pages.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = pages[i];
			if(item.content == null || item.content == "") continue;
			if(item.contentLowerCase == null) item.contentLowerCase = item.content.toLowerCase();
			var posList = orc.utils.Util.searchPos(item.contentLowerCase,this.searchWord);
			results = results.concat(orc.utils.Util.createSearchResults(item.content,this.searchWord,posList,Std.parseInt(item.id)));
		}
		return results;
	}
	,searchCore: function(pages) {
		if(this.searchWord == "") return;
		var list = this.searchInPages(pages);
		var dom = this.topBarContent;
		var resultsDom = dom.getElementsByTagName("div")[1];
		if(list == null || list.length == 0) resultsDom.innerHTML = "0 " + L.s("SearchResults","Search Results") + "."; else resultsDom.innerHTML = core.HtmlHelper.toSearchResultHtml(list);
	}
	,getSearchInputDom: function() {
		var dom = this.topBarContent;
		var inputDom = dom.getElementsByTagName("input")[0];
		return inputDom;
	}
	,unlockPage: function() {
		var dom = this.cvsOthers;
		var inputDom = dom.getElementsByTagName("input")[0];
		var word = inputDom.value;
		word = StringTools.trim(word);
		RunTime.tryUnlock(word);
	}
	,inputPwd: function() {
		var dom = this.cvsOthers;
		var inputDom = dom.getElementsByTagName("input")[0];
		var word = inputDom.value;
		word = StringTools.trim(word);
		RunTime.tryPwd(word);
	}
	,search: function() {
		var input = this.getSearchInputDom();
		var word = input.value;
		word = StringTools.trim(word);
		if(word == "") return;
		this.searchWord = word.toLowerCase();
		RunTime.requestSearch($bind(this,this.searchCore));
		RunTime.logSearch(this.searchWord);
	}
	,onTbPageFocus: function(e) {
		this.stopFlip();
		var obj = this.tbPage;
		obj.value = "";
	}
	,onSearchClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnSearch) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("search");
		this.setTopTitle("Search");
		this.currentTopBarButton = this.btnSearch;
		var html = core.HtmlHelper.toSearchHtml();
		this.topBarContent.innerHTML = html;
		this.topBarContent.style.display = "block";
		this.HideBarOnPhone();
	}
	,onThumbsClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnThumbs) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("thumbs");
		this.setTopTitle("ThumbnailView");
		this.currentTopBarButton = this.btnThumbs;
		var html = core.HtmlHelper.toThumbsHtml(RunTime.book.pages);
		this.topBarContent.innerHTML = html;
		this.topBarContent.style.display = "block";
		this.HideBarOnPhone();
	}
	,HideBarOnPhone: function() {
		var hide = false;
		if(RunTime.clientWidth < 600) hide = true;
		if(js.Lib.window.navigator.userAgent.indexOf("iPhone") != -1) hide = true;
		if(hide) this.hideBottomBar();
	}
	,onContentsClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnContents) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("toc");
		this.currentTopBarButton = this.btnContents;
		this.setTopTitle("TableOfContents");
		if(RunTime.contentInfo != null) {
			var html = core.HtmlHelper.toContentsHtml(RunTime.contentInfo);
			this.topBarContent.innerHTML = html;
			this.topBarContent.style.display = "block";
		}
		this.HideBarOnPhone();
	}
	,onSnsClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnSns) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("sns");
		this.currentTopBarButton = this.btnSns;
		this.setTopTitle("ShareOnSocialNetwork");
		if(RunTime.contentInfo != null) {
			var html = core.HtmlHelper.toSnsHtml(RunTime.shareInfo);
			this.topBarContent.innerHTML = html;
			this.topBarContent.style.display = "block";
		}
		this.HideBarOnPhone();
	}
	,onEmailClick: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.stopFlip();
		if(this.currentTopBarButton == this.btnEmail) {
			this.hideTopBar();
			return;
		}
		this.resetAndShowTopBar("email");
		this.currentTopBarButton = this.btnEmail;
		this.setTopTitle("ShareThisFlipBook");
		if(RunTime.contentInfo != null) {
			var html = core.HtmlHelper.toEmailHtml();
			this.topBarContent.innerHTML = html;
			this.topBarContent.style.display = "block";
		}
		this.HideBarOnPhone();
	}
	,focusSearchInput: function() {
		var t = new core.Tweener();
		var self = this;
		t.start(10);
		t.onChange = function(count) {
			if(count == 10) {
				var input = self.getSearchInputDom();
				input.focus();
			}
		};
	}
	,resetAndShowTopBar: function(type) {
		if(type == null) type = "";
		this.resetNoteButton();
		this.resetHighlightButton();
		var dom = this.topBar;
		dom.style.height = "0px";
		var step = 30;
		var height = 300;
		this.setVisible(this.topBarContent,false);
		this.setVisible(this.topFullTextContent,false);
		if(type == "text") {
			HtmlDomHelper.setTopBarMaxSize(dom);
			HtmlDomHelper.setTopFullTextContentMaxSize(this.topFullTextContent);
			height = RunTime.clientHeight - 45 | 0;
			step = step / 10 | 0;
		} else HtmlDomHelper.setTopBarDefaultSize(dom);
		var t = new core.Tweener();
		var self = this;
		self.setVisible(self.topBarContent,false);
		dom.style.height = Std.string(height) + "px";
		if(type == "text") self.setVisible(self.topFullTextContent,true); else self.setVisible(self.topBarContent,true);
		if(type == "search") self.focusSearchInput();
		this.setVisible(this.topBar,true);
		this.topBarContent.innerHTML = "";
	}
	,setTopTitle: function(val) {
		var dom = js.Lib.document.getElementById("topTitle");
		dom.innerHTML = L.s(val);
	}
	,setVisible: function(dom,val) {
		if(val == true) dom.style.display = "inline"; else dom.style.display = "none";
	}
	,hideTopBar: function() {
		this.setVisible(this.topBar,false);
		this.currentTopBarButton = null;
	}
	,loadCtxVideos: function() {
		var videos = new Array();
		if(RunTime.book != null && RunTime.book.videos != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.videos.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.videos[i];
				if(item.pageNum == current) videos.push(item);
			}
		}
		this.bookContext.videos = videos;
	}
	,loadCtxHotlinks: function() {
		var links = new Array();
		if(RunTime.book != null && RunTime.book.hotlinks != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.hotlinks.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.hotlinks[i];
				if(item.pageNum == current) links.push(item);
			}
		}
		this.bookContext.hotlinks = links;
	}
	,loadCtxSlideshow: function() {
		var slides = new Array();
		if(RunTime.book != null && RunTime.book.slideshows != null) {
			var current = 0;
			if(this.currentPageNum != null) current = this.currentPageNum;
			var _g1 = 0, _g = RunTime.book.slideshows.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.slideshows[i];
				if(item.pageNum == current) slides.push(item);
			}
		}
		this.bookContext.slideshow = slides;
		this.updateSlideshow();
	}
	,clearCtxNote: function() {
		this.bookContext.notes = null;
	}
	,clearCtxHighLight: function() {
		this.bookContext.highlights = null;
	}
	,clearCtxButtons: function() {
		this.bookContext.buttons = null;
	}
	,clearCtxHotlinks: function() {
		this.bookContext.hotlinks = null;
	}
	,onTopBarTouchMove: function(e) {
		e.preventDefault();
		var obj = e;
		var touch = obj.touches.item(0);
		var offset = this.touchTopBarY - touch.pageY;
		this.topBarContent.scrollTop += Math.round(offset) | 0;
		this.topFullTextContent.scrollTop += Math.round(offset) | 0;
	}
	,onTopBarTouchEnd: function(e) {
		this.touchTopBarActive = false;
	}
	,onTopBarTouchStart: function(e) {
		this.touchTopBarActive = true;
		var obj = e;
		var touch = obj.touches.item(0);
		this.touchTopBarY = touch.pageY;
	}
	,onGestureEnd: function(e) {
		e.stopPropagation();
	}
	,onGestureChange: function(e) {
		e.stopPropagation();
	}
	,onGestureStart: function(e) {
		e.stopPropagation();
	}
	,move: function(offsetX,offsetY) {
		this.bookContext.offsetX += offsetX;
		this.bookContext.offsetY += offsetY;
		this.updateVideoLayout();
		this.bookContext.render();
	}
	,onTouchMove: function(e) {
		if(!this.bStartNote && this.isMoveNote) {
			if(this.isMoveNote) this.moveNote.moveClick(e.pageX,e.pageY);
			return;
		}
		if(this.onCursorMove(e.pageX,e.pageY)) this.mask.style.cursor = "pointer"; else this.mask.style.cursor = "default";
		this.bAbortMouseDown = true;
		var t = e;
		if(t.type == "mousemove") {
			this.onMouseTouchMove(e);
			return;
		}
		if(RunTime.isPopupModal()) return;
		if(this.bStartHighLight) {
			e.preventDefault();
			var obj = e;
			var touch = obj.touches[0];
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			if(this.currentHighLight == null) return;
			if(Math.abs(this.gestureLastX - this.currentHighLight.tx) <= 10 || Math.abs(this.gestureLastY - this.currentHighLight.ty) <= 10) return;
			this.currentHighLight.twidth = this.gestureLastX - this.currentHighLight.tx;
			this.currentHighLight.theight = this.gestureLastY - this.currentHighLight.ty;
			this.getHighLightContext().clearRect(0,0,js.Lib.window.document.body.clientWidth,js.Lib.window.document.body.clientHeight);
			this.bookContext.render();
			this.currentHighLight.draw(this.getHighLightContext());
			return;
		}
		if(this.bStartNote) {
			e.preventDefault();
			var obj = e;
			var touch = obj.touches[0];
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			this.currentNote.twidth = 32;
			this.currentNote.theight = 32;
			this.getNoteContext().clearRect(0,0,js.Lib.window.document.body.clientWidth,js.Lib.window.document.body.clientHeight);
			this.bookContext.render();
			this.currentNote.draw(this.getNoteContext());
			return;
		}
		var obj = e;
		var touch = obj.touches[0];
		var touch2 = obj.touches[1];
		var date = new Date();
		var offsetX = touch.clientX - this.touchStartX;
		var offsetY = touch.clientY - this.touchStartY;
		if(!this.checkCanZoom()) obj.preventDefault();
		if(this.zoomStatus == core.ZoomStatus.zoomed && obj.touches.length == 1) {
			if(this.currentOrgX + offsetX > js.Lib.document.body.clientWidth / 2) offsetX = js.Lib.document.body.clientWidth / 2 - this.currentOrgX;
			if(this.currentOrgX + offsetX < -js.Lib.document.body.clientWidth / 2) offsetX = -js.Lib.document.body.clientWidth / 2 - this.currentOrgX;
			if(this.currentOrgY + offsetY > js.Lib.document.body.clientHeight / 2) offsetY = js.Lib.document.body.clientHeight / 2 - this.currentOrgY;
			if(this.currentOrgY + offsetY < -js.Lib.document.body.clientHeight / 2) offsetY = -js.Lib.document.body.clientHeight / 2 - this.currentOrgY;
			this.zoom.style.cssText = this.getZoomInMoveCSS(offsetX | 0,offsetY | 0,false);
			this.moveDX = offsetX | 0;
			this.moveDY = offsetY | 0;
		} else if(this.zoomStatus != core.ZoomStatus.zoomed && obj.touches.length == 1 && Math.abs(js.Lib.window.innerWidth - RunTime.clientWidth) < 10) {
			this.zoomLeftPage.src = "";
			this.zoomLeftPage.style.display = "none";
			this.zoomRightPage.src = "";
			this.zoomRightPage.style.display = "none";
			if(offsetX > 20) {
				this.turnToPrevPage(null);
				this.touchActive = false;
			} else if(offsetX < -20) {
				this.turnToNextPage(null);
				this.touchActive = false;
			}
			this.zoomAt(null,null);
			obj.preventDefault();
			this.startMoveGesture = false;
		}
		this.lastTouchX = touch.clientX;
		this.lastTouchY = touch.clientY;
	}
	,onMouseTouchMove: function(e) {
		if(RunTime.isPopupModal()) return;
		if(this.bStartHighLight) {
			e.preventDefault();
			var obj = e;
			var touch = obj;
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			if(this.currentHighLight == null) return;
			if(Math.abs(this.gestureLastX - this.currentHighLight.tx) <= 10 || Math.abs(this.gestureLastY - this.currentHighLight.ty) <= 10) return;
			this.currentHighLight.twidth = this.gestureLastX - this.currentHighLight.tx;
			this.currentHighLight.theight = this.gestureLastY - this.currentHighLight.ty;
			this.getHighLightContext().clearRect(0,0,js.Lib.window.document.body.clientWidth,js.Lib.window.document.body.clientHeight);
			this.bookContext.render();
			this.currentHighLight.draw(this.getHighLightContext());
			return;
		}
		if(this.bStartNote) {
			e.preventDefault();
			var obj = e;
			var touch = obj;
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			this.currentNote.twidth = 32;
			this.currentNote.theight = 32;
			this.getNoteContext().clearRect(0,0,js.Lib.window.document.body.clientWidth,js.Lib.window.document.body.clientHeight);
			this.bookContext.render();
			this.currentNote.draw(this.getNoteContext());
			return;
		}
		var obj = e;
		var touch = obj;
		var date = new Date();
		var offsetX = touch.clientX - this.touchStartX;
		var offsetY = touch.clientY - this.touchStartY;
		if(!this.checkCanZoom()) obj.preventDefault();
		if(this.zoomStatus == core.ZoomStatus.zoomed && this.startMoveGesture) {
			if(this.currentOrgX + offsetX > js.Lib.document.body.clientWidth / 2) offsetX = js.Lib.document.body.clientWidth / 2 - this.currentOrgX;
			if(this.currentOrgX + offsetX < -js.Lib.document.body.clientWidth / 2) offsetX = -js.Lib.document.body.clientWidth / 2 - this.currentOrgX;
			if(this.currentOrgY + offsetY > js.Lib.document.body.clientHeight / 2) offsetY = js.Lib.document.body.clientHeight / 2 - this.currentOrgY;
			if(this.currentOrgY + offsetY < -js.Lib.document.body.clientHeight / 2) offsetY = -js.Lib.document.body.clientHeight / 2 - this.currentOrgY;
			this.zoom.style.cssText = this.getZoomInMoveCSS(offsetX | 0,offsetY | 0,true);
			this.moveDX = offsetX | 0;
			this.moveDY = offsetY | 0;
		}
		if(this.zoomStatus != core.ZoomStatus.zoomed && this.startMoveGesture && Math.abs(js.Lib.window.innerWidth - RunTime.clientWidth) < 10) {
			this.zoomLeftPage.src = "";
			this.zoomLeftPage.style.display = "none";
			this.zoomRightPage.src = "";
			this.zoomRightPage.style.display = "none";
			if(offsetX > 0) {
				this.turnToPrevPage(null);
				this.touchActive = false;
			} else if(offsetX < 0) {
				this.turnToNextPage(null);
				this.touchActive = false;
			}
			this.zoomAt(null,null);
			obj.preventDefault();
			this.startMoveGesture = false;
		}
		e.stopPropagation();
		e.preventDefault();
		this.lastTouchX = touch.clientX;
		this.lastTouchY = touch.clientY;
	}
	,checkCanZoom: function() {
		var num = 0;
		if(this.currentPageNum != null) num = this.currentPageNum;
		var page = RunTime.getPage(num);
		return page.canZoom;
	}
	,onTouchEnd: function(e) {
		this.bAbortMouseDown = false;
		if(this.bStartHighLight && this.gestureLastX != -1 && this.gestureLastY != -1) {
			var obj = e;
			e.preventDefault();
			if(this.gestureLastX < this.currentHighLight.tx) {
				this.currentHighLight.tx = this.gestureLastX;
				this.currentHighLight.twidth = Math.abs(this.currentHighLight.twidth);
			}
			if(this.gestureLastY < this.currentHighLight.ty) {
				this.currentHighLight.ty = this.gestureLastY;
				this.currentHighLight.theight = Math.abs(this.currentHighLight.theight);
			}
			this.currentHighLight.save();
			RunTime.book.highlights.push(this.currentHighLight.clone());
			this.loadCtxHighLights();
			this.bookContext.render();
			this.gestureLastX = -1;
			this.gestureLastY = -1;
			this.currentHighLight.tx = 0;
			this.currentHighLight.ty = 0;
			this.currentHighLight.twidth = 0;
			this.currentHighLight.theight = 0;
			this.currentHighLight.tpageNum = this.getCurrentPageNum();
			this.currentHighLight = null;
			this.onButtonMaskClick(null);
			return;
		}
		if(this.bStartNote && this.gestureLastX != -1 && this.gestureLastY != -1) {
			var obj = e;
			e.preventDefault();
			this.currentNote.twidth = 32;
			this.currentNote.theight = 32;
			this.currentNote.save();
			var saveObj = this.currentNote.clone();
			RunTime.book.notes.push(saveObj);
			this.loadCtxNotes();
			this.bookContext.render();
			this.gestureLastX = -1;
			this.gestureLastY = -1;
			this.currentNote.tx = 0;
			this.currentNote.ty = 0;
			this.currentNote.twidth = 0;
			this.currentNote.theight = 0;
			this.currentNote.tpageNum = this.getCurrentPageNum();
			this.onButtonNoteClick(null);
			RunTime.currentNote = saveObj;
			RunTime.currentNote.click();
			return;
		}
		this.totalDistance += this.totalLast;
		if(this.startZoomGesture) this.hideBottomBar();
		if(this.startMoveGesture) {
			this.currentOrgX += this.moveDX;
			this.currentOrgY += this.moveDY;
			this.moveDX = 0;
			this.moveDY = 0;
		}
		if(this.totalDistance <= 0) {
		}
		e.stopPropagation();
		this.touchActive = false;
		this.startZoomGesture = false;
		this.startFingerDistance = 0;
		this.startMoveGesture = false;
		if(!this.bStartNote && this.isMoveNote) {
			this.stopFlip();
			this.isMoveNote = false;
			this.moveNote = null;
			if(RunTime.currentMoveNote != null) RunTime.currentMoveNote.moveSave();
			return;
		}
		return;
	}
	,getFullUrl: function() {
		return RunTime.urlIndex + "?page=" + Std.string(this.currentPageNum) + "&bbv=" + this.getCurrentBBV() + "&pcode=" + RunTime.pcode;
	}
	,resizeContainer: function(w,h,l,t) {
	}
	,getDistance: function(touch1,touch2) {
		var x1 = touch1.clientX;
		var x2 = touch2.clientX;
		var y1 = touch1.clientY;
		var y2 = touch2.clientY;
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}
	,zoomIn: function(page,point0,point1) {
		this.zoomStatus = core.ZoomStatus.zoomed;
		if(page == null) return;
		if(!page.locked) this.zoomLeftPage.src = page.getBigPageUrl(); else {
		}
		this.zoomLeftPage.style.display = "inline";
	}
	,zoomOut: function() {
		this.zoomStatus = core.ZoomStatus.normal;
	}
	,zoomAt: function(point0,point1) {
		var num = 0;
		if(this.currentPageNum != null) num = this.currentPageNum;
		var page = RunTime.getPage(num);
		if(point0 == null || point1 == null) this.zoomOut(); else this.zoomIn(page,point0,point1);
	}
	,fillImg: function(urlPage) {
		this.zoomLeftPage.src = urlPage;
	}
	,onTouchStart: function(e) {
		if(!this.bStartNote) {
			if(this.onNoteMoveClick(e.pageX,e.pageY)) this.isMoveNote = true;
		}
		var obj = e;
		if(obj.touches == null) {
			this.onMouseTouchStart(e);
			return;
		}
		var touch = obj.touches[0];
		if(this.onHighLightClick(touch.pageX,touch.pageY)) return;
		if(this.onNoteClick(touch.pageX,touch.pageY)) return;
		if(this.bStartHighLight) {
			this.currentHighLight = new core.HighLight();
			this.currentHighLight.tx = touch.pageX;
			this.currentHighLight.ty = touch.pageY;
			if(RunTime.singlePage) this.currentHighLight.tpageNum = this.getCurrentPageNum(); else if(RunTime.book.rightToLeft) {
				if(this.currentHighLight.tx > RunTime.clientWidth / 2) this.currentHighLight.tpageNum = this.leftPageNum - 1; else this.currentHighLight.tpageNum = this.rightPageNum - 1;
			} else if(this.currentHighLight.tx > RunTime.clientWidth / 2) this.currentHighLight.tpageNum = this.rightPageNum - 1; else this.currentHighLight.tpageNum = this.leftPageNum - 1;
			return;
		}
		if(this.bStartNote) {
			this.currentNote = new core.NoteIcon();
			this.currentNote.tx = touch.pageX;
			this.currentNote.ty = touch.pageY;
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			if(RunTime.singlePage) this.currentNote.tpageNum = this.getCurrentPageNum(); else if(RunTime.book.rightToLeft) {
				if(this.currentNote.tx > RunTime.clientWidth / 2) this.currentNote.tpageNum = this.leftPageNum - 1; else this.currentNote.tpageNum = this.rightPageNum - 1;
			} else if(this.currentNote.tx > RunTime.clientWidth / 2) this.currentNote.tpageNum = this.rightPageNum - 1; else this.currentNote.tpageNum = this.leftPageNum - 1;
			return;
		}
		var date = new Date();
		if(this.lastTouchTime != null) {
			var lastTime = this.lastTouchTime.getTime();
			var newTime = date.getTime();
			if(newTime - lastTime < RunTime.doubleClickIntervalMs) {
				this.zoomAt(0,0);
				this.lastTouchTime = null;
				if(this.zoomStatus == core.ZoomStatus.zoomed) {
				} else {
				}
				return;
			}
		}
		this.lastTouchTime = date;
		this.stopFlip();
		this.touchActive = true;
		if(this.zoomStatus == core.ZoomStatus.zoomed) this.touchActive = false;
		this.onButtonLinkClick(touch.pageX,touch.pageY);
		this.touchStartX = touch.clientX;
		this.touchStartY = touch.clientY;
		this.lastTouchX = this.touchStartX;
		this.lastTouchY = this.touchStartY;
		this.startMoveGesture = true;
	}
	,onCursorMove: function(x,y) {
		var hotLink = this.bookContext.getHotLinkAt(x,y);
		if(hotLink != null) return true;
		var buttonInfo = this.bookContext.getButtonAt(x,y);
		if(buttonInfo != null) return true;
		var highLight = this.bookContext.getHighLightAt(x,y);
		if(highLight != null) return true;
		var noteIcon = this.bookContext.getNoteAt(x,y);
		if(noteIcon != null) return true;
		return false;
	}
	,onNoteMoveClick: function(x,y) {
		this.moveNote = this.bookContext.getNoteAt(x,y);
		if(this.moveNote != null) {
			RunTime.currentMoveNote = this.moveNote;
			return true;
		} else RunTime.currentMoveNote = null;
		return false;
	}
	,onMouseTouchStart: function(e) {
		var obj = e;
		var touch = obj;
		if(this.onHighLightClick(touch.pageX,touch.pageY)) return;
		if(this.onNoteClick(touch.pageX,touch.pageY)) return;
		if(this.bStartHighLight) {
			this.currentHighLight = new core.HighLight();
			this.currentHighLight.tx = touch.pageX;
			this.currentHighLight.ty = touch.pageY;
			if(RunTime.singlePage) this.currentHighLight.tpageNum = this.getCurrentPageNum(); else if(RunTime.book.rightToLeft) {
				if(this.currentHighLight.tx > RunTime.clientWidth / 2) this.currentHighLight.tpageNum = this.leftPageNum - 1; else this.currentHighLight.tpageNum = this.rightPageNum - 1;
			} else if(this.currentHighLight.tx > RunTime.clientWidth / 2) this.currentHighLight.tpageNum = this.rightPageNum - 1; else this.currentHighLight.tpageNum = this.leftPageNum - 1;
			return;
		}
		if(this.bStartNote) {
			this.currentNote = new core.NoteIcon();
			this.currentNote.tx = touch.pageX;
			this.currentNote.ty = touch.pageY;
			this.gestureLastX = touch.pageX;
			this.gestureLastY = touch.pageY;
			if(RunTime.singlePage) this.currentNote.tpageNum = this.getCurrentPageNum(); else if(RunTime.book.rightToLeft) {
				if(this.currentNote.tx > RunTime.clientWidth / 2) this.currentNote.tpageNum = this.leftPageNum - 1; else this.currentNote.tpageNum = this.rightPageNum - 1;
			} else if(this.currentNote.tx > RunTime.clientWidth / 2) this.currentNote.tpageNum = this.rightPageNum - 1; else this.currentNote.tpageNum = this.leftPageNum - 1;
			return;
		}
		var date = new Date();
		if(this.lastTouchTime != null) {
			var lastTime = this.lastTouchTime.getTime();
			var newTime = date.getTime();
			if(newTime - lastTime < RunTime.doubleClickIntervalMs) {
				this.zoomAt(0,0);
				this.lastTouchTime = null;
				if(this.zoomStatus == core.ZoomStatus.zoomed) {
				} else {
				}
				return;
			}
		}
		this.lastTouchTime = date;
		this.stopFlip();
		this.touchActive = true;
		if(this.zoomStatus == core.ZoomStatus.zoomed) this.touchActive = false;
		var centerX = js.Lib.document.body.clientWidth / 2 | 0;
		var centerY = js.Lib.document.body.clientHeight / 2 | 0;
		var _dx = 0;
		var _dy = 0;
		var xInBook = touch.pageX;
		var yInBook = touch.pageY;
		if(this.zoomLevel > 1) {
			_dx = -(touch.pageX - centerX + this.currentOrgX / (this.zoomLevel - 1) | 0);
			_dy = -(touch.pageY - centerY + this.currentOrgY / (this.zoomLevel - 1) | 0);
			xInBook = touch.pageX + _dx * (this.zoomLevel - 1) / this.zoomLevel;
			yInBook = touch.pageY + _dy * (this.zoomLevel - 1) / this.zoomLevel;
		}
		if(this.onButtonLinkClick(xInBook,yInBook)) this.startMoveGesture = false; else this.startMoveGesture = true;
		this.touchStartX = touch.clientX;
		this.touchStartY = touch.clientY;
		this.lastTouchX = this.touchStartX;
		this.lastTouchY = this.touchStartY;
	}
	,onMouseMove: function(e) {
		e.stopPropagation();
		if(this.zoomStatus == core.ZoomStatus.zoomed) {
		}
	}
	,onDblClick: function(e) {
		e.stopPropagation();
		this.ZoomWithCSS();
	}
	,ZoomWithCSS: function() {
		this.zoomLevel += 1;
		this.zoomStatus = core.ZoomStatus.zoomed;
		if(this.zoomLevel > 2) {
			this.zoomLevel = 1;
			this.zoomStatus = core.ZoomStatus.normal;
			this.zoomAt(null,null);
			this.zoom.style.cssText = this.getZoomOutCSS();
			this.resetCSS();
			this.showBottomBar(null);
			return;
		}
		this.resetCSS();
		this.zoomAt(0,0);
		this.zoom.style.cssText = this.getZoomInCSS();
		this.hideBottomBar(null);
	}
	,setCurrentPage: function(val) {
		var t = this.tbPage;
		t.value = Std.string(val);
	}
	,setPageCount: function(val) {
		this.tbPageCount.innerHTML = "/&nbsp;" + Std.string(val);
	}
	,onEnterPage: function() {
		this.updateFullText();
		this.updateAudios();
		this.zoomAt(0,0);
	}
	,TansRightToLeft: function() {
		this.turnToPage(RunTime.book.pages.length - 1);
	}
	,turnToLastPage: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.clearZoom();
		this.stopFlip();
		if(RunTime.book.rightToLeft) this.turnToPage(0); else this.turnToPage(RunTime.book.pages.length - 1);
	}
	,turnToFirstPage: function(e) {
		if(this.topMenuBarBg.style.opacity == 0) return;
		this.clearZoom();
		this.stopFlip();
		if(RunTime.book.rightToLeft) this.turnToPage(RunTime.book.pages.length - 1); else this.turnToPage(0);
	}
	,turnToPrevPage: function(e) {
		this.clearZoom();
		this.stopFlip();
		this.turnPage(-1);
	}
	,clearZoom: function() {
		if(this.zoomLeftPage.src != "") {
			this.zoomLeftPage.src = "";
			this.zoomLeftPage.style.display = "none";
		}
		if(this.zoomRightPage.src != "") {
			this.zoomRightPage.src = "";
			this.zoomRightPage.style.display = "none";
		}
		RunTime.clearPopupContents();
		this.resetNoteButton();
		this.resetHighlightButton();
	}
	,turnToNextPage: function(e) {
		this.clearZoom();
		this.stopFlip();
		this.turnPage(1);
	}
	,turnToPage: function(pageNum) {
		this.clearZoom();
		this.preloadPages(pageNum);
		var page = RunTime.getPage(pageNum);
		if(page == null) return;
		this.setCurrentPage(pageNum + 1);
		this.currentPageNum = pageNum;
		this.hideTopBar();
		RunTime.flipBook.rightPageLock.style.display = "none";
		RunTime.flipBook.leftPageLock.style.display = "none";
		if(page != null && page.locked && RunTime.bLocked) RunTime.flipBook.leftPageLock.style.display = "block";
		this.clearSlideshow();
		this.loadCtxHotlinks();
		this.loadCtxSlideshow();
		this.loadCtxButtons();
		this.loadCtxHighLights();
		this.loadCtxNotes();
		this.loadCurrentBookmark();
		this.clearVideos();
		this.bookContext.removeAllPages();
		this.bookContext.resetLayoutParams();
		this.bookContext.addPage(page);
		this.bookContext.pageOffset = 0;
		this.bookContext.render();
		this.updateVideos();
		this.updateAudios();
		RunTime.logPageView(pageNum + 1);
	}
	,turnPage: function(pageOffset) {
		if(pageOffset == 0) return;
		if(RunTime.book.rightToLeft) pageOffset = 0 - pageOffset;
		if(RunTime.book == null || RunTime.book.pages == null) return;
		var dstPageNum = this.currentPageNum + pageOffset;
		var dstPage = RunTime.getPage(dstPageNum);
		if(dstPage == null) return;
		this.resetZoom();
		this.setCurrentPage(dstPageNum + 1);
		this.preloadPages(dstPageNum + 1);
		var self = this;
		this.bookContext.removeAllPages();
		this.bookContext.resetLayoutParams();
		this.bookContext.addPage(RunTime.getPage(this.currentPageNum,0));
		this.bookContext.addPage(RunTime.getPage(this.currentPageNum,1));
		this.bookContext.addPage(RunTime.getPage(this.currentPageNum,-1));
		this.bookContext.pageOffset = 0;
		if(this.tweener != null) this.tweener.stop();
		var maxCount = 15;
		this.tweener.onChange = function(count) {
			var ratio = count / maxCount;
			if(RunTime.book.rightToLeft) self.bookContext.pageOffset = pageOffset * ratio; else self.bookContext.pageOffset = -pageOffset * ratio;
			if(count == maxCount) self.bookContext.pageOffset = -pageOffset;
			if(count == maxCount) {
				self.currentPageNum = dstPageNum;
				self.loadCtxHotlinks();
				self.loadCtxSlideshow();
				self.loadCtxButtons();
				self.loadCtxHighLights();
				self.loadCtxNotes();
				self.updateVideos();
				self.loadCurrentBookmark();
				RunTime.flipBook.rightPageLock.style.display = "none";
				RunTime.flipBook.leftPageLock.style.display = "none";
				if(dstPage != null && dstPage.locked && RunTime.bLocked) RunTime.flipBook.leftPageLock.style.display = "block";
				RunTime.logPageView(dstPageNum + 1);
				RunTime.clearPopupContents();
				self.onEnterPage();
			}
			self.bookContext.render();
		};
		this.clearCtxHotlinks();
		this.clearCtxButtons();
		this.clearVideos();
		this.clearSlideshow();
		this.tweener.start(maxCount | 0);
	}
	,onMouseDown: function(e) {
		e.stopPropagation();
		if(this.bStartHighLight || this.bStartNote || this.bAbortMouseDown) return;
		if(this.zoomStatus == core.ZoomStatus.zoomed) return;
		if(this.topMenuBarBg.style.opacity != RunTime.bottomBarAlpha) this.showBottomBar(e); else this.hideBottomBar(e);
	}
	,onMouseUp: function(e) {
	}
	,onNoteClick: function(x,y) {
		var note = this.bookContext.getNoteAt(x,y);
		if(note != null && this.bStartNote) {
			RunTime.currentNote = note;
			note.click();
			return true;
		} else RunTime.currentNote = null;
		return false;
	}
	,onHighLightClick: function(x,y) {
		var highlight = this.bookContext.getHighLightAt(x,y);
		if(highlight != null) {
			RunTime.currentHighLight = highlight;
			highlight.click();
			return true;
		} else RunTime.currentHighLight = null;
		return false;
	}
	,onButtonLinkClick: function(x,y) {
		var hotlink = this.bookContext.getHotLinkAt(x,y);
		if(hotlink != null) {
			hotlink.click();
			return true;
		}
		var button = this.bookContext.getButtonAt(x,y);
		if(button != null) {
			button.click();
			return true;
		}
		return false;
	}
	,loadPage: function(index) {
		RunTime.flipBook.rightPageLock.style.display = "none";
		this.preloadPages(index);
		this.currentPageNum = index;
		this.loadCtxHotlinks();
		this.loadCtxSlideshow();
		this.loadCurrentBookmark();
		var page = RunTime.getPage(this.currentPageNum);
		this.bookContext.addPage(page);
		if(page != null && page.locked && RunTime.bLocked) RunTime.flipBook.leftPageLock.style.display = "block";
		this.bookContext.render();
		var p = this.currentPageNum;
		if(p == null) p = 0;
		RunTime.logPageView(p + 1);
		this.onEnterPage();
	}
	,afterInit: function() {
	}
	,forbidden: function(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	,attachActions: function() {
		if(this.root == null) return;
		this.mask.ondblclick = $bind(this,this.onDblClick);
		if(js.Lib.window.navigator.userAgent.indexOf("MSIE") != -1) {
			this.cvsButton.onclick = $bind(this,this.onTouchStart);
			this.cvsHighLight.onclick = $bind(this,this.onTouchStart);
			this.cvsNote.onclick = $bind(this,this.onTouchStart);
			this.cvsBookmark.onclick = $bind(this,this.onTouchStart);
		}
		this.mask.onclick = $bind(this,this.onMouseDown);
		this.mask.onmousedown = $bind(this,this.onTouchStart);
		this.mask.onmousemove = $bind(this,this.onTouchMove);
		this.mask.onmouseup = $bind(this,this.onTouchEnd);
		this.mask.ontouchstart = $bind(this,this.onTouchStart);
		this.mask.ontouchmove = $bind(this,this.onTouchMove);
		this.mask.ontouchend = $bind(this,this.onTouchEnd);
		this.mask.ontouchcancel = $bind(this,this.onTouchEnd);
		this.mask.gestureend = $bind(this,this.onGestureEnd);
		this.mask.gesturestart = $bind(this,this.onGestureStart);
		this.mask.gesturechange = $bind(this,this.onGestureChange);
		this.mask.onscroll = $bind(this,this.forbidden);
		this.mask.onmousewheel = $bind(this,this.forbidden);
		this.cvsVideo.onclick = $bind(this,this.onMouseDown);
		this.cvsVideo.ontouchstart = $bind(this,this.onTouchStart);
		this.cvsVideo.ontouchmove = $bind(this,this.onTouchMove);
		this.cvsVideo.ontouchend = $bind(this,this.onTouchEnd);
		this.cvsVideo.ontouchcancel = $bind(this,this.onTouchEnd);
		this.cvsVideo.gestureend = $bind(this,this.onGestureEnd);
		this.cvsVideo.gesturestart = $bind(this,this.onGestureStart);
		this.cvsVideo.gesturechange = $bind(this,this.onGestureChange);
		this.maskPopup.onscroll = $bind(this,this.forbidden);
		this.maskPopup.onmousewheel = $bind(this,this.forbidden);
		if(js.Lib.window.navigator.userAgent.indexOf("iPad") != -1) {
			this.topBarContent.ontouchstart = $bind(this,this.onTopBarTouchStart);
			this.topBarContent.ontouchmove = $bind(this,this.onTopBarTouchMove);
			this.topBarContent.ontouchend = $bind(this,this.onTopBarTouchEnd);
			this.topBarContent.ontouchcancel = $bind(this,this.onTopBarTouchEnd);
			this.topFullTextContent.ontouchstart = $bind(this,this.onTopBarTouchStart);
			this.topFullTextContent.ontouchmove = $bind(this,this.onTopBarTouchMove);
			this.topFullTextContent.ontouchend = $bind(this,this.onTopBarTouchEnd);
			this.topFullTextContent.ontouchcancel = $bind(this,this.onTopBarTouchEnd);
		}
		this.btnNextPage.onclick = $bind(this,this.turnToNextPage);
		this.btnPrevPage.onclick = $bind(this,this.turnToPrevPage);
		this.btnFirstPage.onclick = $bind(this,this.turnToFirstPage);
		this.btnLastPage.onclick = $bind(this,this.turnToLastPage);
		this.btnContents.onclick = $bind(this,this.onContentsClick);
		this.btnEmail.onclick = $bind(this,this.onEmailClick);
		this.btnSns.onclick = $bind(this,this.onSnsClick);
		this.btnThumbs.onclick = $bind(this,this.onThumbsClick);
		this.btnSearch.onclick = $bind(this,this.onSearchClick);
		this.btnAutoFlip.onclick = $bind(this,this.onAutoFlipClick);
		this.btnShowTxt.onclick = $bind(this,this.onShowTxtClick);
		this.tbPage.onfocus = $bind(this,this.onTbPageFocus);
		this.btnZoom.ontouchstart = $bind(this,this.onZoomClick);
		this.btnMask.onclick = $bind(this,this.onButtonMaskClick);
		this.btnBookMark.onclick = $bind(this,this.onButtonBookmark);
		this.btnNote.onclick = $bind(this,this.onButtonNoteClick);
		this.btnAboutUs.onclick = $bind(this,this.onAboutUsClick);
		this.btnAutoFlip.onclick = $bind(this,this.onAutoFlipClick);
	}
	,getBookmarkContext: function() {
		return this.cvsBookmark.getContext("2d");
	}
	,getNoteContext: function() {
		return this.cvsNote.getContext("2d");
	}
	,getHighLightContext: function() {
		return this.cvsHighLight.getContext("2d");
	}
	,getButtonContext: function() {
		return this.cvsButton.getContext("2d");
	}
	,getContext: function() {
		return this.canvas.getContext("2d");
	}
	,getZoomOutCSS: function() {
		return this.zoomCSS + "-webkit-transform:scale(" + 1 + " );-webkit-transition: all 500ms ;" + "-moz-transform:scale(" + 1 + ");-moz-transition: all 500ms ;" + "top:" + 0 + "px;left:" + 0 + "px;";
	}
	,getZoomInMoveCSS: function(x,y,atonce) {
		if(atonce) return this.zoomCSS + "-webkit-transform:scale(" + this.zoomLevel + " );-webkit-transition: all 0ms ;" + "-moz-transform:scale(" + this.zoomLevel + " ) ; -moz-transition: all 0ms ;" + "top:" + (this.currentOrgY + y | 0) + "px;left:" + (this.currentOrgX + x | 0) + "px;"; else return this.zoomCSS + "-webkit-transform:scale(" + this.zoomLevel + " );-webkit-transition: all 500ms ;" + "-moz-transform:scale(" + this.zoomLevel + " ) ; -moz-transition: all 500ms ;" + "top:" + (this.currentOrgY + y | 0) + "px;left:" + (this.currentOrgX + x | 0) + "px;";
	}
	,getZoomInCSS: function() {
		return this.zoomCSS + "-webkit-transform:scale(" + this.zoomLevel + " );-webkit-transition: all 500ms ;" + "-moz-transform:scale(" + this.zoomLevel + ");-moz-transition: all 500ms ;";
	}
	,rightFlipArrowOut: function(e) {
		this.rightFlipArrow.style.opacity = "0.5";
	}
	,rightFlipArrowOver: function(e) {
		this.rightFlipArrow.style.opacity = "0.9";
	}
	,leftFlipArrowOut: function(e) {
		this.leftFlipArrow.style.opacity = "0.5";
	}
	,leftFlipArrowOver: function(e) {
		this.leftFlipArrow.style.opacity = "0.9";
	}
	,showFlipArrow: function() {
		this.leftFlipArrow = js.Lib.document.createElement("div");
		this.leftFlipArrow.id = "leftFlipArrow";
		this.leftFlipArrow.style.position = "absolute";
		this.leftFlipArrow.style.zIndex = 100;
		this.leftFlipArrow.style.width = 100 + "px";
		this.leftFlipArrow.style.height = 100 + "px";
		this.leftFlipArrow.style.top = (RunTime.clientHeight - 60) / 2 + "px";
		this.leftFlipArrow.style.left = -50 + "px";
		this.leftFlipArrow.style.opacity = 0.50;
		this.leftFlipArrow.style.borderRadius = "50%";
		this.leftFlipArrow.style.cursor = "pointer";
		this.leftFlipArrow.style.background = "#083954";
		this.leftFlipArrow.style.borderColor = "#083954";
		this.rightFlipArrow = js.Lib.document.createElement("div");
		this.rightFlipArrow.id = "rightFlipArrow";
		this.rightFlipArrow.style.position = "absolute";
		this.rightFlipArrow.style.zIndex = 100;
		this.rightFlipArrow.style.width = 100 + "px";
		this.rightFlipArrow.style.height = 100 + "px";
		this.rightFlipArrow.style.top = (RunTime.clientHeight - 60) / 2 + "px";
		this.rightFlipArrow.style.right = -50 + "px";
		this.rightFlipArrow.style.opacity = 0.50;
		this.rightFlipArrow.style.borderRadius = "50%";
		this.rightFlipArrow.style.cursor = "pointer";
		this.rightFlipArrow.style.background = "#083954";
		this.rightFlipArrow.style.borderColor = "#083954";
		js.Lib.document.getElementById("zoom").appendChild(this.leftFlipArrow);
		js.Lib.document.getElementById("zoom").appendChild(this.rightFlipArrow);
		js.Lib.document.getElementById("leftFlipArrow").innerHTML = "<div style='position:relative; margin:0 auto; left:22px; top:36px; width:20px; height:20px; font-size:26px; color:#FFFFFF';font-weight:bold;><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAASCAYAAABvqT8MAAAACXBIWXMAAAsTAAALEwEAmpwYAAA4JGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTYtMTAtMDRUMTM6MjI6MTYrMDg6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0wNFQxMzoyMzowNiswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTYtMTAtMDRUMTM6MjM6MDYrMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MzE0NTE4MzUtNmViZC02MjRkLTg1NjgtNjRjNmVmYTc1M2U0PC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjMxNDUxODM1LTZlYmQtNjI0ZC04NTY4LTY0YzZlZmE3NTNlNDwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjMxNDUxODM1LTZlYmQtNjI0ZC04NTY4LTY0YzZlZmE3NTNlNDwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDozMTQ1MTgzNS02ZWJkLTYyNGQtODU2OC02NGM2ZWZhNzUzZTQ8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMTAtMDRUMTM6MjI6MTYrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTI8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PnGkzSoAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAANpJREFUeNq00j1KQ0EUhuFRuIIiJIIgYilY3NI2VdaQHahNCpsUAQtXkdYdJGAl2GmRSrCxEVyChVbBH4xPCk/AIvdmLByYZuA98x6+LyH95ab/AM7QyQE2cOrnjHFQBzRwjgmecYz1KqBAF68xvRNvC5VWcYI3vOCobukivn4PjS7WqoACvZg6QX/uXAW08BTOg1CrzWEPF/jAI9o5wW3hBt+4w2FO0pu4xifu52Etq8YORvjCLcplwAr2cYUpHn7r1XVpN7SmGGI7p60lLqNXjdx6N6O5CWk2APB1qx2tieQtAAAAAElFTkSuQmCC'/></div>";
		js.Lib.document.getElementById("rightFlipArrow").innerHTML = "<div style='position:relative; margin:0 auto; right:22px; top:36px; width:20px; height:20px; font-size:26px; color:#FFFFFF';font-weight:bold;><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAASCAYAAABvqT8MAAAACXBIWXMAAAsTAAALEwEAmpwYAAA53mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTYtMTAtMDRUMTM6MjI6MTYrMDg6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNi0xMC0wNFQxMzoyNToyOCswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTYtMTAtMDRUMTM6MjU6MjgrMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MzllYjA5YWEtZTQxMC05MTQ0LTk1NjAtNzY0MDQyOWNhNDNkPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjMxNDUxODM1LTZlYmQtNjI0ZC04NTY4LTY0YzZlZmE3NTNlNDwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjMxNDUxODM1LTZlYmQtNjI0ZC04NTY4LTY0YzZlZmE3NTNlNDwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDozMTQ1MTgzNS02ZWJkLTYyNGQtODU2OC02NGM2ZWZhNzUzZTQ8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMTAtMDRUMTM6MjI6MTYrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MzllYjA5YWEtZTQxMC05MTQ0LTk1NjAtNzY0MDQyOWNhNDNkPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTEwLTA0VDEzOjI1OjI4KzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5eGnROAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAADUSURBVHjapNKxSsJRHMXxf4KBIlgQiDQGDo2uTT6Db1AtDS4NgkNP0dobJDgJbTU0CS4tQo/gYFNUon4a/DV2r9GF33K53x/nnHsKFH+Z4j9AF4NdgRaebU8P1RxQwQXmeMcN6jlJ5ZAFb7iKu6zpcyzwgUuUcsB+bJ/jM6SWc7FW0A8/C1z/QKkIS7gNT684ywEdzPCFOxyngDYm2OARhykPLUyxxANqqZRO8YQVhmik/qGNF6wxxgn2fgOOcB+Pp2jmulSP/oxC1k71ruIgV+/vAQAj/KsdY6f4fwAAAABJRU5ErkJggg=='/></div>";
		this.leftFlipArrow.onclick = $bind(this,this.turnToPrevPage);
		this.rightFlipArrow.onclick = $bind(this,this.turnToNextPage);
		this.leftFlipArrow.onmouseover = $bind(this,this.leftFlipArrowOver);
		this.leftFlipArrow.onmouseout = $bind(this,this.leftFlipArrowOut);
		this.rightFlipArrow.onmouseover = $bind(this,this.rightFlipArrowOver);
		this.rightFlipArrow.onmouseout = $bind(this,this.rightFlipArrowOut);
	}
	,requestMainAd: function() {
	}
	,resetCSS: function() {
		this.moveDX = 0;
		this.moveDY = 0;
		this.currentOrgX = 0;
		this.currentOrgY = 0;
	}
	,__class__: FlipBook
}
var DoubleFlipBook = function() {
	this.mainAdLayout = "center";
	this.mainAdDockPos = "halfpage";
	FlipBook.call(this);
};
DoubleFlipBook.__name__ = true;
DoubleFlipBook.__super__ = FlipBook;
DoubleFlipBook.prototype = $extend(FlipBook.prototype,{
	loadCtxNotes: function() {
		var pair = this.getCurrentPair();
		var notes = new Array();
		if(RunTime.book != null && RunTime.book.notes != null) {
			var _g1 = 0, _g = RunTime.book.notes.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.notes[i];
				var match = pair.match(item.pageNum);
				if(match != 0) {
					item.pageLayoutType = match;
					notes.push(item);
				}
			}
		}
		this.bookContext.notes = notes;
	}
	,loadCtxHighLights: function() {
		var pair = this.getCurrentPair();
		var highlights = new Array();
		if(RunTime.book != null && RunTime.book.highlights != null) {
			var _g1 = 0, _g = RunTime.book.highlights.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.highlights[i];
				var match = pair.match(item.pageNum);
				if(match != 0) {
					item.pageLayoutType = match;
					highlights.push(item);
				}
			}
		}
		this.bookContext.highlights = highlights;
	}
	,loadCtxButtons: function() {
		var buttons = new Array();
		if(RunTime.book != null && RunTime.book.buttons != null) {
			var pair = this.getCurrentPair();
			var _g1 = 0, _g = RunTime.book.buttons.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.buttons[i];
				var match = pair.match(item.pageNum);
				if(match != 0 && item.layer == "onpage") {
					item.pageLayoutType = match;
					buttons.push(item);
				} else if(item.layer == "foreground") {
					if((item.pageNum + 1) % 2 != 0) item.pageLayoutType = 1; else item.pageLayoutType = -1;
					buttons.push(item);
				} else if(item.layer == "background") {
					if(pair.leftPage == null && (item.pageNum + 1) % 2 == 0) {
						item.pageLayoutType = -1;
						buttons.push(item);
					}
					if(pair.rightPage == null && (item.pageNum + 1) % 2 != 0) {
						item.pageLayoutType = 1;
						buttons.push(item);
					}
				}
			}
		}
		this.bookContext.buttons = buttons;
	}
	,canTurnRight: function() {
		var num = this.getCurrentPageNum();
		var count = RunTime.book.pages.length;
		if(num % 2 == 1) num++;
		return num < count - 1;
	}
	,showPopupAudio: function(item) {
		item.url = item.destination;
		var pageNum = item.pageNum;
		var audio = new core.AudioInfo();
		audio.pageNum = pageNum;
		audio.url = item.destination;
		if(pageNum % 2 == 1) {
			this.cvsLeftPageBgAudio.innerHTML = "";
			this.cvsLeftPageBgAudio.innerHTML = core.HtmlHelper.toPopupPageAudiosHtml(audio,true);
			var item1 = js.Lib.document.getElementById("cvsLeftPageBgAudio").getElementsByTagName("audio")[0];
			item1.play();
		} else {
			this.cvsRightPageBgAudio.innerHTML = "";
			this.cvsRightPageBgAudio.innerHTML = core.HtmlHelper.toPopupPageAudiosHtml(audio,false);
			var item1 = js.Lib.document.getElementById("cvsRightPageBgAudio").getElementsByTagName("audio")[0];
			item1.play();
		}
	}
	,turnPage: function(pageOffset) {
		var current = 0;
		if(this.currentPageNum != null) current = this.currentPageNum;
		if(RunTime.book.rightToLeft) pageOffset = 0 - pageOffset;
		current = current + pageOffset * 2;
		if(current < 0) current = 0;
		if(current >= RunTime.book.pages.length) current = RunTime.book.pages.length - 1;
		this.turnToPage(current);
	}
	,setCurrentPage: function(val) {
		var count = RunTime.book.pages.length;
		var t = this.tbPage;
		if(val == 1) {
			t.value = Std.string(val);
			this.leftPageNum = -1;
			this.rightPageNum = val;
		} else if(val % 2 == 0 && val == count) {
			t.value = Std.string(val);
			this.leftPageNum = val;
			this.rightPageNum = -1;
		} else {
			var v0 = val - val % 2;
			var v1 = v0 + 1;
			this.leftPageNum = v0;
			this.rightPageNum = v1;
			t.value = Std.string(v0) + "-" + Std.string(v1);
		}
	}
	,loadCtxVideos: function() {
		var videos = new Array();
		if(RunTime.book != null && RunTime.book.videos != null) {
			var pair = this.getCurrentPair();
			var _g1 = 0, _g = RunTime.book.videos.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.videos[i];
				var match = pair.match(item.pageNum);
				if(match != 0) {
					item.pageLayoutType = match;
					videos.push(item);
				}
			}
		}
		this.bookContext.videos = videos;
	}
	,loadCtxHotlinks: function() {
		var links = new Array();
		if(RunTime.book != null && RunTime.book.hotlinks != null) {
			var pair = this.getCurrentPair();
			var _g1 = 0, _g = RunTime.book.hotlinks.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.hotlinks[i];
				var match = pair.match(item.pageNum);
				if(match != 0) {
					item.pageLayoutType = match;
					links.push(item);
				}
			}
		}
		this.bookContext.hotlinks = links;
	}
	,loadCtxSlideshow: function() {
		var slides = new Array();
		if(RunTime.book != null && RunTime.book.slideshows != null) {
			var pair = this.getCurrentPair();
			var _g1 = 0, _g = RunTime.book.slideshows.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = RunTime.book.slideshows[i];
				var match = pair.match(item.pageNum);
				if(match != 0) {
					item.pageLayoutType = match;
					slides.push(item);
				}
			}
		}
		this.bookContext.slideshow = slides;
		this.updateSlideshow();
	}
	,zoomAt: function(point0,point1) {
		var num = 0;
		if(this.currentPageNum != null) num = this.currentPageNum;
		var pair = this.getCurrentPair();
		if(point0 == null || point1 == null) this.pageZoomOut(); else this.pageZoomIn(pair,point0,point1);
	}
	,pageZoomIn: function(page,point0,point1) {
		if(page == null) return;
		if(page.leftPage != null) {
			if(!page.leftPage.locked) this.zoomLeftPage.src = page.leftPage.getBigPageUrl(); else {
			}
			this.zoomLeftPage.style.display = "block";
		}
		if(page.rightPage != null) {
			if(!page.rightPage.locked) this.zoomRightPage.src = page.rightPage.getBigPageUrl(); else {
			}
			this.zoomRightPage.style.display = "block";
		}
	}
	,pageZoomOut: function() {
		this.page_offsetX = 0;
		this.page_offsetY = 0;
	}
	,getCurrentPair: function() {
		var current = 0;
		if(this.currentPageNum != null) current = this.currentPageNum;
		return new core.PagePair(current);
	}
	,getRealValue: function(value) {
		if(value == null || value == "") return 0;
		return Std.parseInt(value.substring(0,value.lastIndexOf("px")));
	}
	,updateAds: function() {
		try {
			if(this.currentPageNum == 0) this.mainAdHtml.style.display = "block"; else this.mainAdHtml.style.display = "none";
		} catch( ex ) {
		}
	}
	,requestMainAd: function() {
		var _g = this;
		this.mainAdHtml = js.Lib.document.getElementById("mainAdhtml");
		var an = js.Lib.document.getElementById("mainAdInner");
		this.mainAdInner = an;
		var img = js.Lib.document.getElementById("mainAdimg");
		this.mainAdImg = img;
		try {
			var ad = null;
			try {
				ad = new haxe.xml.Fast(RunTime.bookInfo.firstElement().elementsNamed("mainAd").next());
			} catch( e ) {
			}
			if(ad != null) {
				if(ad.has.resolve("dockPos")) this.mainAdDockPos = ad.att.resolve("dockPos");
				this.mainAdHtml.style.display = "block";
				this.mainAdHtml.style.marginRight = 0;
				this.mainAdHtml.style.height = RunTime.clientHeight + "px";
				this.mainAdHtml.style.top = 32 + "px";
				if(this.mainAdDockPos == "halfpage") {
					this.mainAdHtml.style.width = RunTime.imagePageWidth + "px";
					this.mainAdHtml.style.left = "0px";
					this.mainAdHtml.style.right = RunTime.clientWidth / 2 + "px";
				} else if(this.mainAdDockPos == "halfscreen") {
					this.mainAdHtml.style.left = "0px";
					this.mainAdHtml.style.width = RunTime.clientWidth / 2 + "px";
				}
				var isHtmlAD = false;
				try {
					if(ad.getInnerData() != null && StringTools.trim(ad.getInnerData()) != "") isHtmlAD = true;
				} catch( err ) {
				}
				if(isHtmlAD) {
					this.mainAdHtml.style.overflow = "hide";
					this.mainAdHtml.innerHTML = ad.getInnerData();
				} else if(ad.has.resolve("url")) {
					this.mainAdImg.src = ad.att.resolve("url");
					if(ad.has.resolve("layout")) this.mainAdLayout = ad.att.resolve("layout");
					if(ad.has.resolve("href")) {
						this.mainAdHref = ad.att.resolve("href");
						this.mainAdInner.href = this.mainAdHref;
						this.mainAdInner.target = ad.has.resolve("target")?ad.att.resolve("target"):"_blank";
					}
					if(this.mainAdLayout == "center") {
						this.mainAdInner.style.verticalAlign = "middle";
						this.mainAdInner.style.textAlign = "center";
						this.mainAdInner.style.position = "static";
						this.mainAdInner.style.display = "block";
						this.mainAdInner.style.margin = "0 auto";
						this.mainAdImg.style.maxHeight = this.mainAdHtml.style.height;
						this.mainAdImg.style.maxWidth = this.mainAdHtml.style.width;
					} else if(this.mainAdLayout == "stretch") {
						this.mainAdImg.style.height = this.mainAdHtml.style.height;
						this.mainAdImg.style.width = this.mainAdHtml.style.width;
					} else if(this.mainAdLayout == "kk") {
						this.mainAdImg.style.height = "300px";
						this.mainAdImg.style.width = "300px";
					} else {
						this.mainAdInner.style.verticalAlign = "middle";
						this.mainAdInner.style.textAlign = "right";
						this.mainAdImg.style.maxHeight = this.mainAdHtml.style.height;
						this.mainAdImg.style.maxWidth = this.mainAdHtml.style.width;
					}
				}
			}
			this.mainAdImg.onload = function(e) {
				_g.mainAdInner.style.top = (RunTime.clientHeight - _g.mainAdImg.height) / 2.5 + "px";
				_g.mainAdInner.style.width = _g.mainAdImg.width + "px";
			};
			this.updateAds();
		} catch( e ) {
			js.Lib.alert(e);
		}
	}
	,turnToPage: function(pageNum) {
		var _g = this;
		this.preloadPages(pageNum);
		var current = this.getCurrentPageNum();
		if(current < 0 || current >= RunTime.book.pages.length) return;
		if(pageNum < 0 || pageNum >= RunTime.book.pages.length) return;
		var oldPair = new core.PagePair(current);
		var newPair = new core.PagePair(pageNum);
		var oldNum = oldPair.getNumInDoubleMode();
		var newNum = newPair.getNumInDoubleMode();
		if(newNum < 0 || oldNum == newNum) return;
		this.bookContext.removeAllPages();
		this.bookContext.resetLayoutParams();
		this.setCurrentPage(pageNum + 1);
		this.bookContext.addPage(oldPair.leftPage);
		this.bookContext.addPage(oldPair.rightPage);
		this.bookContext.addPage(newPair.leftPage);
		this.bookContext.addPage(newPair.rightPage);
		if(newPair.leftPage != null) RunTime.logPageView(newPair.leftPage.num + 1);
		if(newPair.rightPage != null) RunTime.logPageView(newPair.rightPage.num + 1);
		this.bookContext.pageOffset = 0;
		var pageOffset = 0;
		var offset = 0;
		var dstPageOffset = newNum > oldNum?1:-1;
		var ldp = RunTime.getDrawParams(-1);
		var rdp = RunTime.getDrawParams(1);
		var update = function(val) {
			var downLeft = oldPair.leftPage;
			var downRight = oldPair.rightPage;
			var upLeft = newPair.leftPage;
			var upRight = newPair.rightPage;
			if(dstPageOffset > 0) {
				if(RunTime.book.rightToLeft) {
					if(downLeft != null) {
						if(val <= 0.5) downLeft.drawParams = ldp; else downLeft.drawParams = ldp.sliceRight(2 - val * 2);
					}
					if(downRight != null) {
					}
					if(upLeft != null) upLeft.drawParams = ldp.sliceRight(val,-ldp.dw * 2 * (1 - val));
					if(upRight != null) upRight.drawParams = rdp.sliceLeft(val);
				} else {
					if(downLeft != null) {
						if(val <= 0.5) downLeft.drawParams = ldp; else downLeft.drawParams = ldp.sliceLeft(2 - val * 2);
					}
					if(downRight != null) {
					}
					if(upLeft != null) upLeft.drawParams = ldp.sliceLeft(val,ldp.dw * 2 * (1 - val));
					if(upRight != null) upRight.drawParams = rdp.sliceRight(val);
				}
			} else {
				val = -val;
				if(RunTime.book.rightToLeft) {
					if(downLeft != null) {
						if(val <= 0.5) downLeft.drawParams = ldp.sliceLeft(1 - 2 * val); else downLeft.drawParams = null;
					}
					if(downRight != null) {
						if(val <= 0.5) downRight.drawParams = rdp; else downRight.drawParams = rdp.sliceLeft(2 - val * 2);
					}
					if(upLeft != null) upLeft.drawParams = ldp.sliceRight(val);
					if(upRight != null) upRight.drawParams = rdp.sliceLeft(val,rdp.dw * 2 * (1 - val));
				} else {
					if(downLeft != null) {
						if(val <= 0.5) downLeft.drawParams = ldp.sliceRight(1 - 2 * val); else downLeft.drawParams = null;
					}
					if(downRight != null) {
						if(val <= 0.5) downRight.drawParams = rdp; else downRight.drawParams = rdp.sliceRight(2 - val * 2);
					}
					if(upLeft != null) upLeft.drawParams = ldp.sliceLeft(val);
					if(upRight != null) upRight.drawParams = rdp.sliceRight(val,-rdp.dw * 2 * (1 - val));
				}
			}
		};
		update(0);
		if(this.tweener != null) this.tweener.stop();
		var self = this;
		var ctx = this.bookContext;
		var maxCount = 8;
		this.tweener.onChange = function(count) {
			var ratio = count / maxCount;
			offset = dstPageOffset * ratio * ratio * ratio;
			update(offset);
			if(count == maxCount) {
				ctx.clear(true);
				ctx.addPage(newPair.leftPage);
				ctx.addPage(newPair.rightPage);
				self.currentPageNum = pageNum;
				self.loadCtxHotlinks();
				self.loadCtxSlideshow();
				self.loadCtxButtons();
				self.loadCtxHighLights();
				self.loadCtxNotes();
				self.loadCurrentBookmark();
				self.updateVideos();
				self.onEnterPage();
				RunTime.flipBook.rightPageLock.style.display = "none";
				RunTime.flipBook.leftPageLock.style.display = "none";
				if(newPair.rightPage != null && newPair.rightPage.locked && RunTime.bLocked) RunTime.flipBook.rightPageLock.style.display = "block";
				if(newPair.leftPage != null && newPair.leftPage.locked && RunTime.bLocked) RunTime.flipBook.leftPageLock.style.display = "block";
			}
			self.bookContext.render();
			_g.updateAds();
		};
		this.clearCtxHotlinks();
		this.clearCtxButtons();
		this.clearCtxNote();
		this.clearCtxHighLight();
		this.clearVideos();
		this.clearSlideshow();
		this.tweener.start(maxCount | 0);
		this.hideTopBar();
	}
	,getCurrentPageAudios: function() {
		var audios = RunTime.book.audios;
		var match = { left : null, right : null};
		var lftPg = -1;
		var rtPg = -1;
		var p = this.getCurrentPair();
		if(p.leftPage != null) lftPg = p.leftPage.num;
		if(p.rightPage != null) rtPg = p.rightPage.num;
		var _g1 = 0, _g = audios.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = audios[i];
			if(item.pageNum == lftPg) match.left = item; else if(item.pageNum == rtPg) match.right = item;
		}
		return match;
	}
	,getFullText: function(pages) {
		var lftPg = -1;
		var rtPg = -1;
		var p = this.getCurrentPair();
		if(p.leftPage != null) lftPg = p.leftPage.num;
		if(p.rightPage != null) rtPg = p.rightPage.num;
		if(lftPg > rtPg) {
			var tmp = rtPg;
			rtPg = lftPg;
			lftPg = tmp;
		}
		var result = "";
		var _g1 = 0, _g = pages.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = pages[i];
			if(item.num == lftPg) {
				result += "<br />";
				result += "<br />";
				result += "==== Page " + Std.string(lftPg + 1) + " ====";
				result += "<br />";
				result += "<br />";
				result += item.content;
				result += "<br />";
				result += "<br />";
			} else if(item.num == rtPg) {
				result += "<br />";
				result += "<br />";
				result += "==== Page " + Std.string(rtPg + 1) + " ====";
				result += "<br />";
				result += "<br />";
				result += item.content;
				result += "<br />";
				result += "<br />";
			}
		}
		result = StringTools.replace(result,"\n","<br />");
		return result;
	}
	,loadPage: function(index) {
		this.preloadPages(index);
		this.currentPageNum = index;
		this.loadCtxHotlinks();
		this.loadCtxSlideshow();
		this.loadCtxButtons();
		this.loadCtxHighLights();
		this.loadCtxNotes();
		this.loadCurrentBookmark();
		this.updateVideos();
		var p = this.getCurrentPair();
		this.bookContext.addPage(p.leftPage);
		this.bookContext.addPage(p.rightPage);
		if(p.rightPage != null && p.rightPage.locked && RunTime.bLocked) RunTime.flipBook.rightPageLock.style.display = "block";
		if(p.leftPage != null && p.leftPage.locked && RunTime.bLocked) RunTime.flipBook.leftPageLock.style.display = "block";
		this.bookContext.render();
		if(p.leftPage != null) RunTime.logPageView(p.leftPage.num + 1);
		if(p.rightPage != null) RunTime.logPageView(p.rightPage.num + 1);
		this.onEnterPage();
		if(index != null) this.updateAds();
	}
	,checkCanZoom: function() {
		var p = this.getCurrentPair();
		if(p.leftPage != null) {
			if(!p.leftPage.canZoom) return false;
		}
		if(p.rightPage != null) {
			if(!p.rightPage.canZoom) return false;
		}
		return true;
	}
	,afterInit: function() {
		this.tbPage.style.width = "60px";
	}
	,__class__: DoubleFlipBook
});
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	customReplace: function(s,f) {
		var buf = new StringBuf();
		while(true) {
			if(!this.match(s)) break;
			buf.b += Std.string(this.matchedLeft());
			buf.b += Std.string(f(this));
			s = this.matchedRight();
		}
		buf.b += Std.string(s);
		return buf.b;
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchedRight: function() {
		if(this.r.m == null) throw "No string matched";
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	,matchedLeft: function() {
		if(this.r.m == null) throw "No string matched";
		return this.r.s.substr(0,this.r.m.index);
	}
	,matched: function(n) {
		return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
			var $r;
			throw "EReg::matched";
			return $r;
		}(this));
	}
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,__class__: EReg
}
var Hash = function() {
	this.h = { };
};
Hash.__name__ = true;
Hash.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += Std.string("{");
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += Std.string(" => ");
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += Std.string(", ");
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: Hash
}
var HtmlDomHelper = function() { }
HtmlDomHelper.__name__ = true;
HtmlDomHelper.setTopBarDefaultSize = function(dom) {
	dom.style.width = "500px";
	dom.style.left = Std.string((RunTime.clientWidth - 500) / 2 | 0) + "px";
}
HtmlDomHelper.setTopBarMaxSize = function(dom) {
	dom.style.width = Std.string(RunTime.clientWidth | 0) + "px";
	dom.style.left = "0px";
}
HtmlDomHelper.setTopFullTextContentMaxSize = function(dom) {
	dom.style.width = Std.string((RunTime.clientWidth | 0) - 20) + "px";
	dom.style.top = "35px";
	dom.style.height = Std.string((RunTime.clientHeight | 0) - 80) + "px";
	dom.style.left = "0px";
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
}
HxOverrides.strDate = function(s) {
	switch(s.length) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k = s.split("-");
		return new Date(k[0],k[1] - 1,k[2],0,0,0);
	case 19:
		var k = s.split(" ");
		var y = k[0].split("-");
		var t = k[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
}
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var IntIter = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = true;
IntIter.prototype = {
	next: function() {
		return this.min++;
	}
	,hasNext: function() {
		return this.min < this.max;
	}
	,__class__: IntIter
}
var L = function() { }
L.__name__ = true;
L.s = function(key,dftVal) {
	if(L.instance.exists(key) == false) return dftVal != null?dftVal:key; else return L.instance.get(key);
}
L.loadRemote = function(url,onSuccess,onError) {
	orc.utils.Util.request(url,function(data) {
		var xml = Xml.parse(data);
		L.loadXml(xml);
		if(onSuccess != null) onSuccess();
	},onError);
}
L.loadXml = function(xml) {
	if(xml == null) return;
	var i = xml.elementsNamed("lang");
	if(i.hasNext() == false) return;
	xml = i.next();
	i = xml.elementsNamed("item");
	while(i.hasNext() == true) {
		var node = i.next();
		var key = node.get("key");
		var val = node.get("value");
		L.instance.set(key,val);
	}
}
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	map: function(f) {
		var b = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			b.add(f(v));
		}
		return b;
	}
	,filter: function(f) {
		var l2 = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			if(f(v)) l2.add(v);
		}
		return l2;
	}
	,join: function(sep) {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		while(l != null) {
			if(first) first = false; else s.b += Std.string(sep);
			s.b += Std.string(l[0]);
			l = l[1];
		}
		return s.b;
	}
	,toString: function() {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		s.b += Std.string("{");
		while(l != null) {
			if(first) first = false; else s.b += Std.string(", ");
			s.b += Std.string(Std.string(l[0]));
			l = l[1];
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
	}
	,clear: function() {
		this.h = null;
		this.q = null;
		this.length = 0;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,last: function() {
		return this.q == null?null:this.q[0];
	}
	,first: function() {
		return this.h == null?null:this.h[0];
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
}
var Main = function() { }
Main.__name__ = true;
Main.main = function() {
	if(js.Lib.document.getElementById("cvsBook") == null) Zoom.Load(); else RunTime.init();
}
Main.testCss = function() {
	var t = new core.Tweener();
	var max = 20;
	var cvs = js.Lib.document.getElementById("img");
	t.onChange = function(count) {
		var l = Std.string(count * 30);
		cvs.style.left = l;
	};
	t.start(max);
}
var core = core || {}
core.Book = function() {
	this.pages = new Array();
	this.hotlinks = new Array();
	this.videos = new Array();
	this.audios = new Array();
	this.buttons = new Array();
	this.highlights = new Array();
	this.notes = new Array();
	this.bookmarks = new Array();
	this.slideshows = new Array();
	this.bookId = "";
	this.bookTitle = "";
	this.analyticsUA = "";
	this.singlepageMode = false;
	this.rightToLeft = false;
	this.menuTocVisible = true;
	this.menuThumbsVisible = true;
	this.menuSearchVisible = true;
	this.menuAutoFlipVisible = true;
	this.menuZoomVisible = true;
	this.menuBookmarkVisible = true;
	this.menuNoteVisible = true;
	this.menuHighlightVisible = true;
};
core.Book.__name__ = true;
core.Book.prototype = {
	preloadPages: function(num) {
		if(num == null) num = 0;
		if(num < 0 || num > this.pages.length - 1) return;
		var p = [];
		p.push(num);
		p.push(num + 1);
		p.push(num - 1);
		p.push(num + 2);
		p.push(num - 2);
		p.push(num + 3);
		p.push(num - 3);
		p.push(num + 4);
		p.push(num + 5);
		var tp = [];
		var _g1 = 0, _g = p.length;
		while(_g1 < _g) {
			var i = _g1++;
			var index = p[i];
			if(index >= 0 && index < this.pages.length) {
				var page = this.pages[index];
				page.getImagePage();
				page.loadBigImagePage();
				tp.push(index + 1);
			}
		}
	}
	,__class__: core.Book
}
var haxe = haxe || {}
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = window.setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.measure = function(f,pos) {
	var t0 = haxe.Timer.stamp();
	var r = f();
	haxe.Log.trace(haxe.Timer.stamp() - t0 + "s",pos);
	return r;
}
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
}
haxe.Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.id == null) return;
		window.clearInterval(this.id);
		this.id = null;
	}
	,__class__: haxe.Timer
}
var RunTime = function() { }
RunTime.__name__ = true;
RunTime.alert = function(msg) {
	js.Lib.alert(msg);
}
RunTime.init = function() {
	RunTime.kvPrex = js.Lib.window.location.pathname.split("?")[0];
	RunTime.loadingLogo = js.Lib.document.getElementById("loadingLogo");
	RunTime.clientWidth = js.Lib.window.document.body.clientWidth;
	RunTime.clientHeight = js.Lib.window.document.body.clientHeight;
	RunTime.defaultPageNum = Std.parseInt(orc.utils.Util.getUrlParam("page"));
	var dom = js.Lib.document.getElementById("hiddenSearch");
	var html = dom.innerHTML;
	dom.innerHTML = "";
	RunTime.searchHtmlCache = html;
	dom = js.Lib.document.getElementById("hiddenInput");
	html = dom.innerHTML;
	dom.innerHTML = "";
	RunTime.inputHtmlCache = html;
	RunTime.bgImage = js.Lib.document.getElementById("bgImage");
	RunTime.divLoading = js.Lib.document.getElementById("loading");
	RunTime.divLoading.style.top = (RunTime.clientHeight - RunTime.divLoading.clientHeight) / 2 + "px";
	RunTime.divLoading.style.left = (RunTime.clientWidth - RunTime.divLoading.clientWidth) / 2 + "px";
	RunTime.divLoading.style.display = "inline";
	RunTime.resizeTimer.run = RunTime.OnResize;
	js.Lib.window.document.body.onwebkitfullscreenchange = RunTime.onFullscreenChange;
	RunTime.preRequestBookInfo();
}
RunTime.onFullscreenChange = function(e) {
	RunTime.isFullscreen = !RunTime.isFullscreen;
	if(RunTime.isFullscreen) RunTime.resizeTimer.stop(); else {
		RunTime.resizeTimer = new haxe.Timer(600);
		RunTime.resizeTimer.run = RunTime.OnResize;
	}
}
RunTime.OnResize = function() {
	if(RunTime.isFullscreen) return;
	if(RunTime.clientWidth != js.Lib.window.document.body.clientWidth || RunTime.clientHeight != js.Lib.window.document.body.clientHeight) RunTime.reload();
}
RunTime.loadState = function() {
	var bbv = true;
	var params = orc.utils.Util.getUrlParams();
	var _g1 = 0, _g = params.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = params[i];
		if(item.key == "page") {
			var num = Std.parseInt(item.value);
			RunTime.defaultPageNum = num;
		} else if(item.key == "bbv") {
			if(item.value == "1") bbv = true; else if(item.value == "0") bbv = false;
		} else if(item.key == "pcode") RunTime.pcode = item.value;
	}
	if(bbv == true) RunTime.flipBook.showBottomBar(); else RunTime.flipBook.hideBottomBar(null,false);
}
RunTime.requestLanguages = function(callbackFunc) {
	orc.utils.Util.request(RunTime.urlLang,function(data) {
		var xml = Xml.parse(data);
		var i = xml.elementsNamed("languages");
		if(i.hasNext() == false) return;
		xml = i.next();
		i = xml.elementsNamed("language");
		if(i.hasNext() == false) return;
		var dftLang = null;
		while(i.hasNext() == true) {
			var node = i.next();
			var lang = new core.LangCfg();
			var cnt = node.get("content");
			var dft = node.get("default");
			if(dftLang == null) dftLang = lang;
			lang.content = cnt;
			if(dft == "yes" || dft == "Yes" || dft == "YES") {
				lang.isDefault = true;
				dftLang = lang;
			}
			RunTime.languages.push(lang);
		}
		if(dftLang != null) {
			var urlLangResource = RunTime.urlRoot + "data/languages/" + dftLang.content + ".xml";
			L.loadRemote(urlLangResource,callbackFunc,callbackFunc);
		} else callbackFunc();
	},callbackFunc);
}
RunTime.preRequestBookInfo = function() {
	orc.utils.Util.request(RunTime.urlBookinfo,function(data) {
		RunTime.bookInfo = Xml.parse(data);
		RunTime.getBookInfo();
		if(RunTime.book.singlepageMode) {
			RunTime.flipBook = new FlipBook();
			RunTime.singlePage = true;
		} else if(RunTime.clientHeight > RunTime.clientWidth) {
			RunTime.flipBook = new FlipBook();
			RunTime.singlePage = true;
		} else {
			RunTime.flipBook = new DoubleFlipBook();
			RunTime.singlePage = false;
		}
		RunTime.flipBook.zoom = js.Lib.document.getElementById("zoom");
		var bookleftpage = js.Lib.document.getElementById("leftpage");
		RunTime.flipBook.zoomLeftPage = bookleftpage;
		var bookrightpage = js.Lib.document.getElementById("rightpage");
		RunTime.flipBook.zoomRightPage = bookrightpage;
		var leftPageLock = js.Lib.document.getElementById("leftPageLock");
		var rightPageLock = js.Lib.document.getElementById("rightPageLock");
		RunTime.flipBook.leftPageLock = leftPageLock;
		RunTime.flipBook.rightPageLock = rightPageLock;
		var leftLockIcon = js.Lib.document.getElementById("leftLockIcon");
		var rightLockIcon = js.Lib.document.getElementById("rightLockIcon");
		RunTime.flipBook.leftLockIcon = leftLockIcon;
		RunTime.flipBook.rightLockIcon = rightLockIcon;
		RunTime.flipBook.root = js.Lib.document.getElementById("cvsBook");
		RunTime.flipBook.mask = js.Lib.document.getElementById("mask");
		RunTime.flipBook.tbPageCount = js.Lib.document.getElementById("tbPageCount");
		RunTime.flipBook.tbPage = js.Lib.document.getElementById("tbPage");
		RunTime.flipBook.btnContents = js.Lib.document.getElementById("btnContents");
		RunTime.flipBook.btnThumbs = js.Lib.document.getElementById("btnThumbs");
		RunTime.flipBook.btnSearch = js.Lib.document.getElementById("btnSearch");
		RunTime.flipBook.btnMask = js.Lib.document.getElementById("btnMask");
		RunTime.flipBook.btnBookMark = js.Lib.document.getElementById("btnBookMark");
		RunTime.flipBook.btnNote = js.Lib.document.getElementById("btnNote");
		RunTime.flipBook.btnPrevPage = js.Lib.document.getElementById("btnPrevPage");
		RunTime.flipBook.btnNextPage = js.Lib.document.getElementById("btnNextPage");
		RunTime.flipBook.btnFirstPage = js.Lib.document.getElementById("btnFirstPage");
		RunTime.flipBook.btnLastPage = js.Lib.document.getElementById("btnLastPage");
		RunTime.flipBook.btnAutoFlip = js.Lib.document.getElementById("btnAutoFlip");
		RunTime.flipBook.btnDownload = js.Lib.document.getElementById("btnDownload");
		RunTime.flipBook.btnAboutUs = js.Lib.document.getElementById("btnAboutUs");
		RunTime.flipBook.btnEmail = js.Lib.document.getElementById("btnEmail");
		RunTime.flipBook.btnSns = js.Lib.document.getElementById("btnSns");
		RunTime.flipBook.btnShowTxt = js.Lib.document.getElementById("btnShowTxt");
		RunTime.flipBook.imgLogo = js.Lib.document.getElementById("imgLogo");
		RunTime.flipBook.topBar = js.Lib.document.getElementById("topBar");
		RunTime.flipBook.topBarContent = js.Lib.document.getElementById("topBarContent");
		RunTime.flipBook.topFullTextContent = js.Lib.document.getElementById("topFullTextContent");
		RunTime.flipBook.bottomBar = js.Lib.document.getElementById("bottomBar");
		RunTime.flipBook.bottomBarBg = js.Lib.document.getElementById("bottomBarBg");
		RunTime.flipBook.bottomBarBg.style.opacity = RunTime.bottomBarAlpha;
		RunTime.flipBook.topMenuBar = js.Lib.document.getElementById("topMenuBar");
		RunTime.flipBook.topMenuBarBg = js.Lib.document.getElementById("topMenuBarBg");
		RunTime.flipBook.topMenuBarBg.style.opacity = RunTime.bottomBarAlpha;
		RunTime.flipBook.topBarContent.style.zIndex = 10000;
		RunTime.flipBook.menuParent = js.Lib.document.getElementById("menuParent");
		RunTime.flipBook.maskPopup = js.Lib.document.getElementById("maskPopup");
		RunTime.flipBook.cvsSlideshow = js.Lib.document.getElementById("cvsSlideshow");
		RunTime.flipBook.cvsVideo = js.Lib.document.getElementById("cvsVideo");
		RunTime.flipBook.cvsOthers = js.Lib.document.getElementById("cvsOthers");
		RunTime.flipBook.cvsAudio = js.Lib.document.getElementById("cvsAudio");
		RunTime.flipBook.cvsLeftPageBgAudio = js.Lib.document.getElementById("cvsLeftPageBgAudio");
		RunTime.flipBook.cvsRightPageBgAudio = js.Lib.document.getElementById("cvsRightPageBgAudio");
		RunTime.flipBook.cvsYoutube = js.Lib.document.getElementById("cvsYoutube");
		RunTime.flipBook.btnZoom = js.Lib.document.getElementById("btnZoom");
		var left = (RunTime.clientWidth - 500) / 2 | 0;
		RunTime.flipBook.topBar.style.left = Std.string(left) + "px";
		var c = RunTime.flipBook.root;
		RunTime.flipBook.canvas = c;
		c.width = RunTime.clientWidth;
		c.height = RunTime.clientHeight;
		if(RunTime.clientWidth < 800) {
			js.Lib.document.getElementById("btnFirstPage").style.marginLeft = "10px";
			js.Lib.document.getElementById("btnPrevPage").style.marginLeft = "10px";
			js.Lib.document.getElementById("btnNextPage").style.marginLeft = "10px";
			js.Lib.document.getElementById("btnLastPage").style.marginLeft = "10px";
		}
		var cvsButton = js.Lib.document.getElementById("cvsButton");
		RunTime.flipBook.cvsButton = cvsButton;
		cvsButton.width = RunTime.clientWidth;
		cvsButton.height = RunTime.clientHeight;
		var cvsHighLight = js.Lib.document.getElementById("cvsHighLight");
		RunTime.flipBook.cvsHighLight = cvsHighLight;
		cvsHighLight.width = RunTime.clientWidth;
		cvsHighLight.height = RunTime.clientHeight;
		var cvsNote = js.Lib.document.getElementById("cvsNote");
		RunTime.flipBook.cvsNote = cvsNote;
		cvsNote.width = RunTime.clientWidth;
		cvsNote.height = RunTime.clientHeight;
		var cvsBookmark = js.Lib.document.getElementById("cvsBookmark");
		RunTime.flipBook.cvsBookmark = cvsBookmark;
		cvsBookmark.width = RunTime.clientWidth;
		cvsBookmark.height = RunTime.clientHeight;
		RunTime.flipBook.afterInit();
		RunTime.flipBook.bookContext.ctx = RunTime.flipBook.getContext();
		RunTime.flipBook.bookContext.ctxButton = RunTime.flipBook.getButtonContext();
		RunTime.flipBook.bookContext.ctxHighLight = RunTime.flipBook.getHighLightContext();
		RunTime.flipBook.bookContext.ctxNote = RunTime.flipBook.getNoteContext();
		RunTime.flipBook.bookContext.ctxBookmark = RunTime.flipBook.getBookmarkContext();
		RunTime.requestLanguages(RunTime.requestBookInfo);
		RunTime.flipBook.attachActions();
	});
}
RunTime.requestBookInfo = function() {
	orc.utils.Util.request(RunTime.urlBookinfo,function(data) {
		RunTime.bookInfo = Xml.parse(data);
		RunTime.loadBookInfo();
		RunTime.key = RunTime.calcKey(RunTime.book.pageWidth | 0,RunTime.book.pageHeight | 0);
		var defaultKey = "Pwd-Empty";
		if(RunTime.pcode.length > 0) defaultKey = RunTime.decode64(RunTime.pcode);
		var encode = RunTime.encryptKey(defaultKey,RunTime.key);
		if(encode == RunTime.book.password) {
			if(encode == RunTime.book.password && RunTime.pcode.length > 0) RunTime.bLocked = false;
			RunTime.afterRequestBookInfo();
		} else if(RunTime.book.lockPages != null) {
			if(RunTime.book.lockPages.length > 0) {
				if(encode == RunTime.book.password && RunTime.pcode.length > 0) RunTime.bLocked = false;
				RunTime.afterRequestBookInfo();
			}
		} else RunTime.InputPwd();
		if(!RunTime.singlePage) RunTime.flipBook.requestMainAd();
		if(RunTime.book.flipArrow) RunTime.flipBook.showFlipArrow();
		RunTime.hideLoadingLogo();
	});
}
RunTime.InputPwd = function() {
	RunTime.showPopupMaskLayer();
	RunTime.flipBook.cvsOthers.innerHTML = core.HtmlHelper.toInputPwdHtml();
}
RunTime.InputUnlock = function() {
	RunTime.showPopupMaskLayer();
	RunTime.flipBook.cvsOthers.innerHTML = core.HtmlHelper.toInputUnlockPwdHtml();
}
RunTime.tryPwd = function(pwd) {
	var encode = RunTime.encryptKey(pwd,RunTime.key);
	if(encode == RunTime.book.password) {
		RunTime.pcode = StringTools.urlEncode(RunTime.encode64(pwd,false));
		RunTime.afterRequestBookInfo();
	} else js.Lib.window.alert(L.s("PasswordError"));
}
RunTime.tryUnlock = function(pwd) {
	var encode = RunTime.encryptKey(pwd,RunTime.key);
	if(encode == RunTime.book.password) {
		RunTime.pcode = StringTools.urlEncode(RunTime.encode64(pwd,false));
		js.Lib.document.getElementById("inputBox").style.display = "none";
		RunTime.clearPopupContents();
		RunTime.bLocked = false;
		RunTime.flipBook.leftPageLock.style.display = "none";
		RunTime.flipBook.rightPageLock.style.display = "none";
		RunTime.flipBook.bookContext.render();
	} else js.Lib.window.alert(L.s("PasswordError"));
}
RunTime.afterRequestBookInfo = function() {
	RunTime.flipBook.cvsOthers.innerHTML = "";
	RunTime.clearPopupContents();
	RunTime.requestPages();
	RunTime.useAnalyticsUA(RunTime.book.analyticsUA,RunTime.book.bookId);
}
RunTime.requestPages = function() {
	orc.utils.Util.request(RunTime.urlPageInfo,function(data) {
		RunTime.pageInfo = Xml.parse(data);
		RunTime.loadPageInfo();
		RunTime.requestHotlinks();
		RunTime.requestSlideshow();
		RunTime.requestContents();
		RunTime.requestShare();
		RunTime.requestAbout();
		RunTime.requestVideos();
		RunTime.reauestAudios();
		RunTime.requestButtons();
		RunTime.readLocalHighLights();
		RunTime.readLocalNotes();
		RunTime.requestBookmark();
		RunTime.readLocalBookmarks();
	});
}
RunTime.requestSlideshow = function(onSuccess) {
	orc.utils.Util.request(RunTime.urlSlideshow,function(data) {
		var dom = new DOMParser();
		var ctx = new Xml2Html();
		RunTime.slideshow = dom.parseFromString(ctx.prepareXmlAsHtml(data),"text/xml");
		RunTime.loadSlideshow(ctx);
		if(RunTime.flipBook != null) {
			RunTime.flipBook.loadCtxSlideshow();
			RunTime.flipBook.bookContext.render();
		}
		if(onSuccess != null) onSuccess();
	});
}
RunTime.requestHotlinks = function(onSuccess) {
	orc.utils.Util.request(RunTime.urlHotlinks,function(data) {
		var dom = new DOMParser();
		var ctx = new Xml2Html();
		RunTime.hotlinkInfo = dom.parseFromString(ctx.prepareXmlAsHtml(data),"text/xml");
		RunTime.loadHotlinks(ctx);
		if(RunTime.flipBook != null) {
			RunTime.flipBook.loadCtxHotlinks();
			RunTime.flipBook.bookContext.render();
		}
		if(onSuccess != null) onSuccess();
	});
}
RunTime.requestVideos = function(onSuccess) {
	orc.utils.Util.request(RunTime.urlVideos,function(data) {
		RunTime.videoInfo = Xml.parse(data);
		RunTime.loadVideos();
		if(RunTime.flipBook != null) {
			RunTime.flipBook.updateVideos();
			RunTime.flipBook.bookContext.render();
		}
		if(onSuccess != null) onSuccess();
	});
}
RunTime.reauestAudios = function(onSuccess) {
	orc.utils.Util.request(RunTime.urlAudios,function(data) {
		RunTime.audioInfo = Xml.parse(data);
		RunTime.loadAudios();
		if(RunTime.flipBook != null) RunTime.flipBook.updateAudios();
		if(onSuccess != null) onSuccess();
	});
}
RunTime.requestButtons = function(onSuccess) {
	orc.utils.Util.request(RunTime.urlButtons,function(data) {
		RunTime.buttonInfo = Xml.parse(data);
		RunTime.loadButtons();
		if(RunTime.flipBook != null) {
			RunTime.flipBook.loadCtxButtons();
			RunTime.flipBook.bookContext.render();
		}
		if(onSuccess != null) onSuccess();
	});
}
RunTime.requestContents = function() {
	orc.utils.Util.request(RunTime.urlContents,function(data) {
		RunTime.contentInfo = Xml.parse(data);
	});
}
RunTime.requestShare = function() {
	orc.utils.Util.request(RunTime.urlShareInfo,function(data) {
		RunTime.shareInfo = Xml.parse(data);
	});
}
RunTime.requestAbout = function() {
	orc.utils.Util.request(RunTime.urlAbout,function(data) {
		RunTime.aboutInfo = Xml.parse(data);
	});
}
RunTime.requestSearch = function(invoke) {
	orc.utils.Util.request(RunTime.urlSearch,function(data) {
		var dom = new DOMParser();
		var ctx = new Xml2Html();
		RunTime.searchInfo = dom.parseFromString(ctx.prepareXmlAsHtml(data),"text/xml");
		RunTime.loadPageContents(ctx);
		if(invoke != null) invoke(RunTime.book.pages);
	});
}
RunTime.requestBookmark = function() {
	orc.utils.Util.request(RunTime.urlBookmarks,function(data) {
		RunTime.bookmarkInfo = Xml.parse(data);
		var it = RunTime.bookmarkInfo.firstElement().elementsNamed("bookmark");
		do {
			var node = it.next();
			if(node == null) break;
			var bk = new core.Bookmark();
			bk.pageNum = node.get("page");
			bk.text = node.get("content");
			bk.onlyread = true;
			RunTime.book.bookmarks.push(bk);
		} while(it.hasNext());
	});
}
RunTime.invokePageContentsAction = function(invoke) {
	if(RunTime.searchInfo == null) RunTime.requestSearch(invoke); else invoke(RunTime.book.pages);
}
RunTime.loadPageContents = function(ctx) {
	if(RunTime.searchInfo == null) return;
	var dom = RunTime.searchInfo;
	var pages = dom.getElementsByTagName("page");
	var _g1 = 0, _g = pages.length;
	while(_g1 < _g) {
		var i = _g1++;
		var node = pages[i];
		var pageNumVal = node.getAttribute("pageNumber");
		var htmlText = null;
		var htmlTextDoms = node.getElementsByTagName("cdata");
		if(htmlTextDoms != null && htmlTextDoms.length > 0) {
			htmlText = StringTools.trim(htmlTextDoms[0].childNodes[0].nodeValue);
			htmlText = ctx.getCData(htmlText);
		}
		var _g3 = 0, _g2 = RunTime.book.pages.length;
		while(_g3 < _g2) {
			var k = _g3++;
			var page = RunTime.book.pages[k];
			if(page.id == pageNumVal) page.content = htmlText;
		}
	}
}
RunTime.reload = function() {
	js.Lib.window.location.href = RunTime.flipBook.getFullUrl();
}
RunTime.navigateUrl = function(url) {
	if(url == null || url == "null" || url == "") return;
	js.Lib.window.location.href = url;
}
RunTime.showAsButtonClick = function(t) {
	var newMask = js.Lib.document.createElement("div");
	newMask.id = "newMask";
	newMask.style.position = "absolute";
	newMask.style.zIndex = 100;
	newMask.style.width = js.Lib.document.body.scrollWidth + "px";
	newMask.style.height = js.Lib.document.body.scrollHeight + "px";
	newMask.style.top = "0px";
	newMask.style.left = "0px";
	newMask.style.background = "#000";
	newMask.style.opacity = 0.50;
	js.Lib.document.body.appendChild(newMask);
	js.Lib.document.getElementById("cvsOthers").innerHTML = RunTime.slideshowPopupHtml;
	js.Lib.document.getElementById("popupSlideshow").style.cssText += " -moz-transform: scale(1);-moz-transition: width 0.5s ease-out; -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
}
RunTime.clearSlideshowContents = function() {
	js.Lib.document.body.removeChild(js.Lib.document.getElementById("newMask"));
}
RunTime.showLoadingLogo = function(loadingUrl) {
	if(loadingUrl == null || loadingUrl == "") return;
	RunTime.loadingLogo.innerHTML = "<img src='" + loadingUrl + "'>";
	RunTime.loadingLogo.style.top = (RunTime.clientHeight - RunTime.loadingLogo.clientHeight) / 2 + "px";
	RunTime.loadingLogo.style.left = (RunTime.clientWidth - RunTime.loadingLogo.clientWidth) / 2 + "px";
	RunTime.loadingLogo.style.display = "inline";
}
RunTime.hideLoadingLogo = function() {
	RunTime.loadingLogo.innerHTML = "";
	RunTime.loadingLogo.style.display = "none";
}
RunTime.getBookInfo = function() {
	if(RunTime.bookInfo == null) return;
	var i = RunTime.bookInfo.elementsNamed("bookinfo");
	if(i.hasNext() == false) return;
	var node = i.next();
	RunTime.showLoadingLogo(node.get("loadingLogo"));
	RunTime.book.singlepageMode = node.get("singlepageMode") == "true"?true:false;
	RunTime.book.rightToLeft = node.get("rightToLeft") == "true"?true:false;
	RunTime.book.autoFlipSecond = Std.parseInt(node.get("autoFlipSeconds"));
	RunTime.book.gateway = node.get("gateway");
	RunTime.book.shareHref = node.get("shareUrl");
	RunTime.book.flipArrow = node.get("flipArrow") == "true"?true:false;
}
RunTime.loadBookInfo = function() {
	if(RunTime.bookInfo == null) return;
	var i = RunTime.bookInfo.elementsNamed("bookinfo");
	if(i.hasNext() == false) return;
	var node = i.next();
	var idVal = node.get("id");
	if(idVal == null) idVal = "";
	RunTime.book.bookId = idVal;
	RunTime.book.bookTitle = node.get("title");
	RunTime.book.bgColor = node.get("bgColor");
	RunTime.book.bgImageUrl = node.get("bgImage");
	RunTime.book.analyticsUA = node.get("analyticsUA");
	RunTime.book.password = node.get("password");
	RunTime.book.bookDownloadUrl = node.get("pdfUrl");
	var locked = node.get("protectedPages");
	if(locked != null && locked != "") RunTime.book.lockPages = locked.split(",");
	if(RunTime.book.bgColor == "" || RunTime.book.bgColor == null) RunTime.book.bgColor = "gray";
	if(RunTime.book.bgColor != "" && RunTime.book.bgColor != null) js.Lib.document.body.style.backgroundColor = RunTime.book.bgColor;
	if(RunTime.book.bgImageUrl != "" && RunTime.book.bgImageUrl != null) {
		js.Lib.document.body.style.backgroundImage = "url(" + RunTime.book.bgImageUrl + ")";
		js.Lib.document.body.style.backgroundRepeat = "no-repeat";
		js.Lib.document.body.style.backgroundPosition = "center";
		js.Lib.document.body.style.backgroundSize = "cover";
		js.Lib.document.body.style.backgroundClip = "border-box";
	}
	js.Lib.window.document.title = RunTime.book.bookTitle;
	var pageWidth = Std.parseFloat(node.get("pageWidth"));
	var pageHeight = Std.parseFloat(node.get("pageHeight"));
	RunTime.book.pageWidth = pageWidth;
	RunTime.book.pageHeight = pageHeight;
	var m = new orc.utils.ImageMetricHelper(pageWidth,pageHeight);
	var w = RunTime.clientWidth;
	var h = RunTime.clientHeight;
	var scale = m.getMaxFitScale(w,h);
	RunTime.defaultScale = scale;
	RunTime.imagePageWidth = pageWidth * scale;
	RunTime.imagePageHeight = pageHeight * scale;
	RunTime.pageScale = scale;
	var li = node.elementsNamed("bookLogo");
	if(li.hasNext() == true) {
		var lnode = li.next();
		RunTime.book.logoUrl = lnode.get("url");
		RunTime.book.logoHref = lnode.get("href");
	}
	if(RunTime.book.logoUrl != null && RunTime.book.logoUrl != "") {
		var hideLogo = false;
		if(RunTime.clientWidth < 600) hideLogo = true;
		if(js.Lib.window.navigator.userAgent.indexOf("iPhone") != -1) hideLogo = true;
		if(!hideLogo) {
			RunTime.flipBook.imgLogo.style.display = "inline";
			var obj = RunTime.flipBook.imgLogo;
			obj.src = RunTime.book.logoUrl;
			RunTime.flipBook.imgLogo.onclick = RunTime.onLogoClick;
		}
	}
	RunTime.flipBook.btnDownload.onclick = RunTime.onDownloadClick;
	var bottomMenuIter = node.elementsNamed("bottommenu");
	if(bottomMenuIter.hasNext() == true) {
		var bottomMenuNode = bottomMenuIter.next();
		RunTime.book.menuAutoFlipVisible = RunTime.getMenuVisible(bottomMenuNode,"autoflip");
		RunTime.book.menuSearchVisible = RunTime.getMenuVisible(bottomMenuNode,"search");
		if(bottomMenuNode.elementsNamed("text").hasNext()) RunTime.book.menuTxtVisible = RunTime.getMenuVisible(bottomMenuNode,"text"); else RunTime.book.menuTxtVisible = RunTime.getMenuVisible(bottomMenuNode,"txt");
		RunTime.book.menuZoomVisible = RunTime.getMenuVisible(bottomMenuNode,"zoom");
		RunTime.book.menuBookmarkVisible = RunTime.getMenuVisible(bottomMenuNode,"bookmark");
		RunTime.book.menuNoteVisible = RunTime.getMenuVisible(bottomMenuNode,"notes");
		RunTime.book.menuHighlightVisible = RunTime.getMenuVisible(bottomMenuNode,"highlight");
	}
	var leftMenuIter = node.elementsNamed("leftmenu");
	if(leftMenuIter.hasNext() == true) {
		var leftMenuNode = leftMenuIter.next();
		RunTime.book.menuTocVisible = RunTime.getMenuVisible(leftMenuNode,"toc");
		RunTime.book.menuThumbsVisible = RunTime.getMenuVisible(leftMenuNode,"thumbs");
		RunTime.book.menuDownloadVisible = RunTime.getMenuEntirePDF(leftMenuNode,"pdf");
		RunTime.book.menuEmailVisible = RunTime.getMenuVisible(leftMenuNode,"email");
		RunTime.book.menuSnsVisible = RunTime.getMenuVisible(leftMenuNode,"sns");
		RunTime.book.menuAboutUsVisible = RunTime.getMenuVisible(leftMenuNode,"about");
	}
	RunTime.setMenuVisible(RunTime.flipBook.btnContents,RunTime.book.menuTocVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnThumbs,RunTime.book.menuThumbsVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnSearch,RunTime.book.menuSearchVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnAutoFlip,RunTime.book.menuAutoFlipVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnShowTxt,RunTime.book.menuTxtVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnZoom,false);
	RunTime.setMenuVisible(RunTime.flipBook.btnDownload,RunTime.book.menuDownloadVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnEmail,RunTime.book.menuEmailVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnSns,RunTime.book.menuSnsVisible);
	RunTime.setMenuVisible(RunTime.flipBook.btnAboutUs,RunTime.book.menuAboutUsVisible);
	var menuCount = 0;
	if(RunTime.book.menuTocVisible) menuCount += 1;
	if(RunTime.book.menuThumbsVisible) menuCount += 1;
	if(RunTime.book.menuSearchVisible) menuCount += 1;
	if(RunTime.book.menuAutoFlipVisible) menuCount += 1;
	if(RunTime.book.menuTxtVisible) menuCount += 1;
	var hideIcon = false;
	if(RunTime.clientWidth < 480) hideIcon = true;
	if(js.Lib.window.navigator.userAgent.indexOf("iPhone") != -1 && RunTime.clientWidth < 480) hideIcon = true;
	if(hideIcon) {
		if(menuCount < 5) RunTime.setMenuVisible(RunTime.flipBook.btnMask,RunTime.book.menuHighlightVisible);
		if(RunTime.book.menuHighlightVisible) menuCount += 1;
		if(menuCount < 5) {
			RunTime.setMenuVisible(RunTime.flipBook.btnNote,RunTime.book.menuNoteVisible);
			menuCount += 1;
		}
		if(RunTime.book.menuNoteVisible) menuCount += 1;
		if(menuCount < 5) {
			RunTime.setMenuVisible(RunTime.flipBook.btnBookMark,RunTime.book.menuBookmarkVisible);
			menuCount += 1;
		}
	} else {
		RunTime.setMenuVisible(RunTime.flipBook.btnMask,RunTime.book.menuHighlightVisible);
		RunTime.setMenuVisible(RunTime.flipBook.btnNote,RunTime.book.menuNoteVisible);
		RunTime.setMenuVisible(RunTime.flipBook.btnBookMark,RunTime.book.menuBookmarkVisible);
	}
	RunTime.setMenuCursor(RunTime.flipBook.btnPrevPage,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnNextPage,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnFirstPage,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnLastPage,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnAutoFlip,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnZoom,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnContents,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnThumbs,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnShowTxt,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnSearch,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnMask,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnBookMark,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnNote,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnAboutUs,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnDownload,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnEmail,true);
	RunTime.setMenuCursor(RunTime.flipBook.btnSns,true);
	RunTime.loadState();
}
RunTime.setMenuCursor = function(menu,visible) {
	if(visible == true) menu.style.cursor = "pointer"; else menu.style.cursor = "default";
}
RunTime.setMenuVisible = function(menu,visible) {
	if(visible == true) menu.style.display = "inline"; else RunTime.flipBook.menuParent.removeChild(menu);
}
RunTime.getMenuVisible = function(parent,nodeName) {
	var li = parent.elementsNamed(nodeName);
	if(li.hasNext() == true) {
		var lnode = li.next();
		if(lnode.get("visible") == "true") return true;
	}
	return false;
}
RunTime.setTopMenuBarVisible = function() {
	var b_ = false;
	var _g1 = 0, _g = RunTime.flipBook.menuParent.childNodes.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(RunTime.flipBook.menuParent.childNodes[i].nodeName.toUpperCase() == "IMG") {
			if(RunTime.flipBook.menuParent.childNodes[i].style.display.toLowerCase() != "none") {
				b_ = true;
				break;
			}
		}
	}
	if(b_) RunTime.flipBook.topMenuBar.style.display = "inline-block"; else RunTime.flipBook.topMenuBar.style.display = "none";
}
RunTime.getMenuEntirePDF = function(parent,nodeName) {
	var li = parent.elementsNamed(nodeName);
	if(li.hasNext() == true) {
		var lnode = li.next();
		if(lnode.get("entirePDF") == "true") return true;
	}
	return false;
}
RunTime.onLogoClick = function(e) {
	if(RunTime.book == null || RunTime.book.logoHref == null || RunTime.book.logoHref == "") return;
	js.Lib.window.location.href = RunTime.book.logoHref;
}
RunTime.onDownloadClick = function(e) {
	if(RunTime.book == null || RunTime.book.bookDownloadUrl == null || RunTime.book.bookDownloadUrl == "") return;
	js.Lib.window.location.href = RunTime.book.bookDownloadUrl;
}
RunTime.onSendEmail = function() {
	RunTime.sendEmailByService();
}
RunTime.sendEmailResult = function() {
	if(RunTime.sendService.responseText.length < 2) {
		js.Lib.alert(L.s("EmailSendSuccessful"));
		var tomail = js.Lib.window.document.getElementById("tomail");
		tomail.value = "";
		var frommail = js.Lib.window.document.getElementById("youremail");
		frommail.value = "";
		var n = js.Lib.window.document.getElementById("yname");
		n.value = "";
		var m = js.Lib.window.document.getElementById("sharemsg");
		m.value = "";
	} else js.Lib.alert(L.s("EmailSendFailed"));
}
RunTime.sendEmailByService = function() {
	var baseUrl = js.Lib.window.location.href.split("?")[0];
	baseUrl = baseUrl.substring(0,baseUrl.lastIndexOf("/"));
	var tomail = js.Lib.window.document.getElementById("tomail");
	var frommail = js.Lib.window.document.getElementById("youremail");
	var n = js.Lib.window.document.getElementById("yname");
	var subject = L.s("YourFriend","YourFirend") + Std.string(n.value) + L.s("ShareEmailTitle","ShareEmailTitle");
	js.Lib.window.document.getElementById("subject").setAttribute("value",subject);
	var m = js.Lib.window.document.getElementById("sharemsg");
	var msg = m.value;
	msg += "<br /> <br /> " + Std.string(n.value) + L.s("ShareEmailContent") + "<a href='" + baseUrl + "/" + RunTime.book.shareHref + "' target='_black'>" + baseUrl + "/" + RunTime.book.shareHref + "<a/>" + "<br /> <br />" + "<a href='" + baseUrl + "/" + RunTime.book.shareHref + "' target='_black'>" + "<img src='" + baseUrl + "/" + RunTime.book.pages[0].urlThumb + "' >" + "<a/>";
	RunTime.sendService = new XMLHttpRequest();
	var query = "tomail=" + Std.string(tomail.value) + "&frommail=" + Std.string(frommail.value) + "&subject=" + subject + "&message=" + msg;
	RunTime.sendService.open("get",RunTime.book.gateway + "?" + query,true);
	RunTime.sendService.onreadystatechange = RunTime.sendEmailResult;
	RunTime.sendService.send();
}
RunTime.sendEmailByForm = function() {
	var n = js.Lib.window.document.getElementById("yname");
	var subject = L.s("YourFriend","YourFirend") + Std.string(n.value) + L.s("ShareEmailTitle","ShareEmailTitle");
	js.Lib.window.document.getElementById("subject").setAttribute("value",subject);
	var m = js.Lib.window.document.getElementById("sharemsg");
	var msg = m.value;
	msg += "<br /> <br /> " + Std.string(n.value) + L.s("ShareEmailContent") + "<a href='" + RunTime.book.shareHref + "' target='_black'>" + RunTime.book.shareHref + "<a/>" + "<br /> <br />" + "<a href='" + RunTime.book.shareHref + "' target='_black'>" + "<img src='" + RunTime.book.pages[0].urlThumb + "' >" + "<a/>";
	var b = js.Lib.window.document.getElementById("sendEmail");
	b.submit();
}
RunTime.loadPageInfo = function() {
	if(RunTime.pageInfo == null) return;
	var root = RunTime.pageInfo.firstElement();
	var val = root.get("preload");
	if(val.toLowerCase() == "true") RunTime.enablePreload = true;
	var i = root.elementsNamed("page");
	var num = 0;
	var numDouble = 0.1;
	while(i.hasNext() == true) {
		var node = i.next();
		var id = node.get("id");
		var source = node.get("source");
		var medium = node.get("medium");
		var thumb = node.get("thumb");
		var canZoom = !(node.get("canZoom") == "false");
		var page = new core.Page();
		RunTime.book.pages.push(page);
		if(medium == null || medium == "") medium = "content/medium/page" + Std.string(num + 1) + ".jpg";
		page.id = id;
		page.num = num;
		page.numInDoubleMode = Math.round(numDouble) | 0;
		page.urlPage = medium;
		page.urlBigPage = source;
		page.urlThumb = thumb;
		page.urlFullPage = source;
		page.canZoom = canZoom;
		page.locked = RunTime.checkLocked(num + 1);
		numDouble += 0.5;
		num++;
	}
	RunTime.flipBook.setPageCount(RunTime.book.pages.length);
	RunTime.flipBook.setCurrentPage(RunTime.defaultPageNum + 1);
	RunTime.flipBook.loadPage(RunTime.defaultPageNum);
}
RunTime.checkLocked = function(num) {
	if(RunTime.book.lockPages == null || RunTime.book.lockPages.length == 0) return false;
	var _g1 = 0, _g = RunTime.book.lockPages.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(Std.parseInt(RunTime.book.lockPages[i]) == num) return true;
	}
	return false;
}
RunTime.loadSlideshow = function(ctx) {
	if(RunTime.slideshow == null) return;
	var dom = RunTime.slideshow;
	var slides = dom.getElementsByTagName("slideshow");
	var _g1 = 0, _g = slides.length;
	while(_g1 < _g) {
		var i = _g1++;
		var node = slides[i];
		var pageNumVal = node.getAttribute("page");
		var xVal = node.getAttribute("x");
		var yVal = node.getAttribute("y");
		var pagewidth = node.getAttribute("pagewidth");
		var showAsButton = node.getAttribute("showAsButton");
		var popupWidthVal = node.getAttribute("popupWidth");
		var popupHeightVal = node.getAttribute("popupHeight");
		var widthVal = node.getAttribute("width");
		var heightVal = node.getAttribute("height");
		var timeVal = node.getAttribute("time");
		var transitionVal = node.getAttribute("transition");
		var idVal = node.getAttribute("sid");
		var bgColorVal = node.getAttribute("bgColor");
		var slideshowInfo = new core.SlideshowInfo();
		var pics = node.getElementsByTagName("pic");
		var _g3 = 0, _g2 = pics.length;
		while(_g3 < _g2) {
			var j = _g3++;
			var pnode = pics[j];
			var slide = new core.Slide();
			slide.url = pnode.getAttribute("url");
			slide.href = pnode.getAttribute("href");
			slideshowInfo.slides.push(slide);
		}
		slideshowInfo.pageNum = Std.parseInt(pageNumVal) - 1;
		slideshowInfo.x = Std.parseFloat(xVal);
		slideshowInfo.y = Std.parseFloat(yVal);
		slideshowInfo.pagewidth = Std.parseFloat(pagewidth);
		slideshowInfo.showAsButton = showAsButton == "true"?true:false;
		if(popupWidthVal != null) slideshowInfo.popupWidth = Std.parseFloat(popupWidthVal);
		if(popupHeightVal != null) slideshowInfo.popupHeight = Std.parseFloat(popupHeightVal);
		slideshowInfo.width = Std.parseFloat(widthVal);
		slideshowInfo.height = Std.parseFloat(heightVal);
		slideshowInfo.interval = timeVal;
		slideshowInfo.transition = transitionVal;
		if(idVal == null) idVal = "sId_" + i;
		slideshowInfo.id = idVal;
		slideshowInfo.bgColor = bgColorVal;
		RunTime.book.slideshows.push(slideshowInfo);
	}
}
RunTime.loadHotlinks = function(ctx) {
	if(RunTime.hotlinkInfo == null) return;
	var dom = RunTime.hotlinkInfo;
	var links = dom.getElementsByTagName("hotlink");
	var _g1 = 0, _g = links.length;
	while(_g1 < _g) {
		var i = _g1++;
		var node = links[i];
		var pageNumVal = node.getAttribute("page");
		var xVal = node.getAttribute("x");
		var yVal = node.getAttribute("y");
		var widthVal = node.getAttribute("width");
		var heightVal = node.getAttribute("height");
		var colorVal = node.getAttribute("color");
		var opacityVal = node.getAttribute("opacity");
		var destinationVal = node.getAttribute("destination");
		var typeVal = node.getAttribute("type");
		var popupWidthVal = node.getAttribute("popupWidth");
		var popupHeightVal = node.getAttribute("popupHeight");
		var youtubeIdVal = node.getAttribute("youtubeId");
		var target = node.getAttribute("target");
		var window_color = node.getAttribute("windowColor");
		var htmlText = null;
		var htmlTextDoms = node.getElementsByTagName("cdata");
		if(htmlTextDoms != null && htmlTextDoms.length > 0) {
			htmlText = StringTools.trim(htmlTextDoms[0].childNodes[0].nodeValue);
			htmlText = ctx.getCData(htmlText);
			if(htmlText != null) {
				if(htmlText.indexOf("iframe") != -1) {
					var dom1 = new DOMParser();
					var newHtmlDom = dom1.parseFromString(htmlText,"text/xml");
					var iframe = newHtmlDom.getElementsByTagName("iframe")[0];
					if(iframe != null) htmlText = "<iframe src=\"" + iframe.getAttribute("src") + "\" frameborder=\"0\" style=\"width:100%;height:100%\" scrolling=\"yes\" ></iframe>";
				}
			}
		}
		try {
			var iframe = node.getElementsByTagName("iframe")[0];
			if(iframe != null) htmlText = "<iframe src=\"" + iframe.getAttribute("src") + "\" frameborder=\"0\" style=\"width:100%;height:100%\" ></iframe>";
		} catch( ex ) {
		}
		var link = new core.HotLink();
		link.pageNum = Std.parseInt(pageNumVal) - 1;
		link.x = Std.parseFloat(xVal);
		link.y = Std.parseFloat(yVal);
		link.width = Std.parseFloat(widthVal);
		link.height = Std.parseFloat(heightVal);
		link.htmlText = htmlText;
		if(popupWidthVal != null) link.popupWidth = Std.parseInt(popupWidthVal);
		if(popupHeightVal != null) link.popupHeight = Std.parseInt(popupHeightVal);
		link.youtubeId = youtubeIdVal;
		link.type = typeVal == null?"":typeVal;
		if(target != null) link.target = target == ""?"_blank":target;
		if(window_color != null) {
			window_color = StringTools.replace(window_color,"0x","#");
			link.window_color = window_color;
		}
		if(colorVal != null) {
			colorVal = StringTools.replace(colorVal,"0x","#");
			colorVal = StringTools.replace(colorVal,"0X","#");
			link.color = colorVal;
		}
		if(opacityVal != null) link.opacity = Std.parseFloat(opacityVal);
		if(destinationVal != null) link.destination = destinationVal;
		RunTime.book.hotlinks.push(link);
	}
}
RunTime.loadVideos = function() {
	if(RunTime.videoInfo == null) return;
	var index = 0;
	var i = RunTime.videoInfo.firstElement().elementsNamed("video");
	while(i.hasNext() == true) {
		var node = i.next();
		var pageNumVal = node.get("page");
		var xVal = node.get("x");
		var yVal = node.get("y");
		var widthVal = node.get("width");
		var heightVal = node.get("height");
		var autoPlayVal = node.get("autoPlay");
		var showControlVal = node.get("showControl");
		var autoRepeatVal = node.get("autoRepeat");
		var urlVal = node.get("url");
		var youtubeIdVal = node.get("youtubeId");
		var video = new core.VideoInfo();
		video.pageNum = Std.parseInt(pageNumVal) - 1;
		video.x = Std.parseFloat(xVal);
		video.y = Std.parseFloat(yVal);
		video.width = Std.parseFloat(widthVal);
		video.height = Std.parseFloat(heightVal);
		video.autoPlay = autoPlayVal == "true";
		video.showControl = showControlVal == "true";
		video.autoRepeat = autoRepeatVal == "true";
		video.url = urlVal;
		video.youtubeId = youtubeIdVal;
		video.id = "video_embed_" + Std.string(index);
		RunTime.book.videos.push(video);
		index++;
	}
}
RunTime.loadAudios = function() {
	if(RunTime.audioInfo == null) return;
	var index = 0;
	var i = RunTime.audioInfo.firstElement().elementsNamed("pages");
	if(i.hasNext() == true) {
		var index1 = 0;
		i = i.next().elementsNamed("sound");
		while(i.hasNext() == true) {
			var node = i.next();
			var pageNumVal = node.get("pageNumber");
			var urlVal = node.get("url");
			var audio = new core.AudioInfo();
			audio.url = urlVal;
			audio.pageNum = Std.parseInt(pageNumVal) - 1;
			audio.id = "audio_embed_" + Std.string(index1);
			index1++;
			RunTime.book.audios.push(audio);
		}
	}
}
RunTime.extractCData = function(txt) {
	if(txt == null) return null;
	var first = txt.indexOf("<![CDATA[");
	var last = txt.lastIndexOf("]]>");
	if(first < 0 || last < 0 || last < first) return null;
	return HxOverrides.substr(txt,first + "<![CDATA[".length,last - first - "<![CDATA[".length);
}
RunTime.loadButtons = function() {
	if(RunTime.buttonInfo == null) return;
	var i = RunTime.buttonInfo.firstElement().elementsNamed("button");
	while(i.hasNext() == true) {
		var node = i.next();
		var pageNumVal = node.get("page");
		var xVal = node.get("x");
		var yVal = node.get("y");
		var widthVal = node.get("width");
		var heightVal = node.get("height");
		var imageVal = node.get("image");
		var typeVal = node.get("type");
		var popupWidthVal = node.get("popupWidth");
		var popupHeightVal = node.get("popupHeight");
		var youtubeIdVal = node.get("youtubeId");
		var destinationVal = node.get("destination");
		var layer = node.get("layer");
		var textVal = "";
		var fontColorVal = "";
		var fontSizeVal = "";
		var window_color = node.get("windowColor");
		var target = node.get("target");
		if(node.get("text") != null) textVal = node.get("text");
		if(node.get("fontColor") != null) fontColorVal = node.get("fontColor");
		if(node.get("fontSize") != null) fontSizeVal = node.get("fontSize");
		var htmlText = RunTime.extractCData(node.toString());
		if(htmlText != null) {
			if(htmlText.indexOf("iframe") != -1) {
				var dom = new DOMParser();
				var newHtmlDom = dom.parseFromString(htmlText,"text/xml");
				var iframe = newHtmlDom.getElementsByTagName("iframe")[0];
				if(iframe != null) htmlText = "<iframe src=\"" + iframe.getAttribute("src") + "\" frameborder=\"0\" style=\"width:100%;height:100%\" scrolling=\"yes\" ></iframe>";
			}
		}
		try {
			var iframe = node.elementsNamed("iframe").next();
			if(iframe != null) htmlText = "<iframe src=\"" + iframe.get("src") + "\" frameborder=\"0\" style=\"width:100%;height:100%\" ></iframe>";
		} catch( ex ) {
		}
		var item = new core.ButtonInfo();
		item.pageNum = Std.parseInt(pageNumVal) - 1;
		item.x = Std.parseFloat(xVal);
		item.y = Std.parseFloat(yVal);
		item.width = Std.parseFloat(widthVal);
		item.height = Std.parseFloat(heightVal);
		item.layer = layer == null?"onpage":layer;
		item.htmlText = htmlText;
		if(popupWidthVal != null) item.popupWidth = Std.parseInt(popupWidthVal);
		if(popupHeightVal != null) item.popupHeight = Std.parseInt(popupHeightVal);
		item.youtubeId = youtubeIdVal;
		item.destination = destinationVal;
		item.type = typeVal == null?"":typeVal;
		item.image = imageVal;
		item.text = textVal;
		if(target != null) item.target = target == ""?"_blank":target;
		if(window_color != null) item.window_color = window_color;
		if(fontColorVal != "") item.fontColor = fontColorVal;
		if(fontSizeVal != "") item.fontSize = fontSizeVal;
		RunTime.book.buttons.push(item);
	}
}
RunTime.getInputAndJumpToPage = function() {
	RunTime.flipBook.stopFlip();
	var t = RunTime.flipBook.tbPage;
	var val = t.value;
	val = StringTools.trim(val);
	var num = RunTime.flipBook.currentPageNum;
	if(val != "") num = Std.parseInt(val) - 1;
	if(num < 0) num = 0; else if(num > RunTime.book.pages.length - 1) num = RunTime.book.pages.length - 1;
	RunTime.flipBook.tbPage.setAttribute("value",Std.string(num + 1));
	RunTime.flipBook.turnToPage(num);
	RunTime.flipBook.tbPage.blur();
}
RunTime.getPage = function(currentPageNum,pageOffset,useNewDrawParams) {
	if(useNewDrawParams == null) useNewDrawParams = true;
	if(pageOffset == null) pageOffset = 0;
	if(RunTime.book == null || RunTime.book.pages == null) return null;
	var num = currentPageNum + pageOffset;
	if(num < 0 || num > RunTime.book.pages.length - 1) return null;
	var page = RunTime.book.pages[num];
	page.pageOffset = pageOffset;
	if(useNewDrawParams == true) page.drawParams = RunTime.getDrawParams();
	if(RunTime.singlePage) {
		RunTime.flipBook.zoomLeftPage.width = page.drawParams.dw | 0;
		RunTime.flipBook.zoomLeftPage.height = page.drawParams.dh | 0;
		RunTime.flipBook.zoomLeftPage.style.left = Std.string(page.drawParams.dx) + "px";
		RunTime.flipBook.zoomLeftPage.style.top = Std.string(page.drawParams.dy) + "px";
		RunTime.flipBook.leftPageLock.style.width = (page.drawParams.dw | 0) + "px";
		RunTime.flipBook.leftPageLock.style.height = (page.drawParams.dh | 0) + "px";
		RunTime.flipBook.leftPageLock.style.left = Std.string(page.drawParams.dx) + "px";
		RunTime.flipBook.leftPageLock.style.top = Std.string(page.drawParams.dy) + "px";
		RunTime.flipBook.leftLockIcon.style.left = ((page.drawParams.dw - 128) / 2 | 0) + "px";
		RunTime.flipBook.leftLockIcon.style.top = ((page.drawParams.dh - 128) / 2 | 0) + "px";
	}
	return page;
}
RunTime.getDrawParams = function(layout) {
	if(layout == null) layout = 0;
	var dp = new core.DrawParams();
	var im = new orc.utils.ImageMetricHelper(RunTime.book.pageWidth,RunTime.book.pageHeight);
	var cw = RunTime.clientWidth;
	if(layout != 0) cw = 0.5 * cw;
	var ch = RunTime.clientHeight;
	var scale = im.getMaxFitScale(cw,ch);
	var dw = scale * RunTime.book.pageWidth;
	var dh = scale * RunTime.book.pageHeight;
	var dx = 0.5 * (cw - dw);
	if(layout != 0) {
		if(RunTime.book.rightToLeft) dx = layout > 0?cw - dw:cw; else dx = layout < 0?cw - dw:cw;
	}
	var dy = 0.5 * (ch - dh);
	var sx = 0;
	var sy = 0;
	var sw = RunTime.book.pageWidth;
	var sh = RunTime.book.pageHeight;
	dp.sx = sx;
	dp.sy = sy;
	dp.sw = sw;
	dp.sh = sh;
	dp.dx = dx;
	dp.dy = dy;
	dp.dw = dw;
	dp.dh = dh;
	return dp;
}
RunTime.getGolobaDrawParams = function() {
	var dp = new core.DrawParams();
	var im = new orc.utils.ImageMetricHelper(RunTime.book.pageWidth * 2,RunTime.book.pageHeight);
	var cw = RunTime.clientWidth;
	var ch = RunTime.clientHeight;
	var scale = im.getMaxFitScale(cw,ch);
	var dw = scale * RunTime.book.pageWidth * 2;
	var dh = scale * RunTime.book.pageHeight;
	var dx = 0.5 * (cw - dw) * 2;
	var dy = 0.5 * (ch - dh) * 2;
	var sx = 0;
	var sy = 0;
	var sw = RunTime.book.pageWidth * 2;
	var sh = RunTime.book.pageHeight;
	dp.sx = sx;
	dp.sy = sy;
	dp.sw = sw;
	dp.sh = sh;
	dp.dx = dx;
	dp.dy = dy;
	dp.dw = dw;
	dp.dh = dh;
	return dp;
}
RunTime.saveLocal = function(key,val) {
}
RunTime.getLocal = function(key) {
	return "";
}
RunTime.setUpdateFlag = function(bookId) {
	var prefix = bookId == null?RunTime.book.bookId:bookId;
	RunTime.saveLocal(prefix + "-" + "uploadFlag","1");
}
RunTime.getAndResetUpdateFlag = function() {
	var val = RunTime.getLocal(RunTime.book.bookId + "-" + "uploadFlag");
	RunTime.saveLocal(RunTime.book.bookId + "-" + "uploadFlag","");
	return val == "1";
}
RunTime.saveCurrentPageNum = function() {
	RunTime.savePageNum(Std.string(RunTime.flipBook.getCurrentPageNum()));
}
RunTime.savePageNum = function(val,bookId) {
	var prefix = bookId == null?RunTime.book.bookId:bookId;
	RunTime.saveLocal(prefix + "-" + "page",val);
}
RunTime.getAndResetSavedPageNum = function() {
	var val = RunTime.getLocal(RunTime.book.bookId + "-" + "page");
	RunTime.savePageNum("");
	if(val == null || val == "") return 0; else return Std.parseInt(val);
}
RunTime.saveBottomBarVisible = function(val) {
	if(val == true) RunTime.saveLocal(RunTime.book.bookId + "-" + "bottomBarVisible","true"); else RunTime.saveLocal(RunTime.book.bookId + "-" + "bottomBarVisible","false");
}
RunTime.getBottomBarVisible = function() {
	return RunTime.getLocal(RunTime.book.bookId + "-" + "bottomBarVisible") == "true";
}
RunTime.encrypt = function(src) {
	return RunTime.encryptKey(src,RunTime.key);
}
RunTime.encryptKey = function(src,key) {
	var n = 0;
	var rtn = "";
	var _g1 = 0, _g = src.length - 1;
	while(_g1 < _g) {
		var i = _g1++;
		var c = HxOverrides.cca(src,i) + HxOverrides.cca(key,n);
		var s = String.fromCharCode(c);
		rtn += s;
		n++;
		if(n >= key.length - 1) n = 0;
	}
	if(src.length > 0) rtn = rtn + HxOverrides.substr(src,src.length - 1,null);
	return RunTime.encode64(rtn);
}
RunTime.encode64 = function(txt,padding) {
	if(padding == null) padding = true;
	var bytes = haxe.io.Bytes.alloc(txt.length);
	var _g1 = 0, _g = txt.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = txt.charCodeAt(i);
		bytes.b[i] = c & 255;
	}
	var c = new haxe.BaseCode(haxe.io.Bytes.ofString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"));
	var base64 = c.encodeBytes(bytes).toString();
	if(padding == true) {
		var remainder = base64.length % 4;
		if(remainder > 1) base64 += "=";
		if(remainder == 2) base64 += "=";
	}
	return base64;
}
RunTime.decode64 = function(txt) {
	var paddingSize = -1;
	if(txt.charAt(txt.length - 2) == "=") paddingSize = 2; else if(txt.charAt(txt.length - 1) == "=") paddingSize = 1;
	if(paddingSize != -1) txt = HxOverrides.substr(txt,0,txt.length - paddingSize);
	var c = new haxe.BaseCode(haxe.io.Bytes.ofString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"));
	return c.decodeString(txt);
}
RunTime.calcKey = function(w,h) {
	var val = Std.string(w * h);
	val = HxOverrides.substr(val,val.length - 3,null) + HxOverrides.substr(val,0,2);
	var n = "";
	var _g1 = 0, _g = val.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = HxOverrides.cca(val,i) / 2 | 0;
		n = n + StringTools.hex(c);
	}
	return n.toUpperCase();
}
RunTime.clearPopupContents = function() {
	js.Lib.document.getElementById("maskPopup").style.display = "none";
	js.Lib.document.getElementById("cvsOthers").innerHTML = "";
	RunTime.flipBook.resetNoteButton();
	RunTime.flipBook.resetHighlightButton();
}
RunTime.isPopupModal = function() {
	return js.Lib.document.getElementById("maskPopup").style.display == "none"?false:true;
}
RunTime.clearAudio = function() {
	js.Lib.document.getElementById("cvsAudio").innerHTML = "";
}
RunTime.clearBgAudio = function() {
	RunTime.clearLeftBgAudio();
	RunTime.clearRightBgAudio();
}
RunTime.clearLeftBgAudio = function() {
	js.Lib.document.getElementById("cvsLeftPageBgAudio").innerHTML = "";
}
RunTime.clearRightBgAudio = function() {
	js.Lib.document.getElementById("cvsRightPageBgAudio").innerHTML = "";
}
RunTime.showPopupMaskLayer = function() {
	js.Lib.document.getElementById("maskPopup").style.display = "inline";
}
RunTime.playAudio = function() {
	var item = js.Lib.document.getElementById("cvsAudio").getElementsByTagName("audio")[0];
	item.play();
}
RunTime.playVideo = function() {
	var item = js.Lib.document.getElementById("cvsOthers").getElementsByTagName("video")[0];
	item.play();
}
RunTime.setOffset = function(dom,left,top) {
	var l = Math.round(left);
	var t = Math.round(top);
	dom.style.left = Std.string(l) + "px";
	dom.style.top = Std.string(t) + "px";
}
RunTime.useAnalyticsUA = function(ua,id) {
	if(RunTime.isNullOrEmpty(ua)) return;
	try {
		RunTime.trackerId = id;
		var gat = _gat;
		RunTime.tracker = gat._getTracker(ua);
		RunTime.tracker._initData();
	} catch( ex ) {
	}
}
RunTime.log = function(action,msg) {
	if(RunTime.tracker) RunTime.tracker._trackPageview(RunTime.trackerId + "/" + action + "/" + msg);
	var e = eval;
	var t = "if(typeof(customTrackPageView)=='function'){customTrackPageView('" + action + "','" + msg + "')}";
	e(t);
}
RunTime.logPageView = function(pageNum) {
	if(pageNum > 0) RunTime.log("page",Std.string(pageNum));
}
RunTime.logClickLink = function(url,url2) {
	if(RunTime.isNullOrEmpty(url) && RunTime.isNullOrEmpty(url2)) return;
	RunTime.log("link",RunTime.isNullOrEmpty(url) == false?url:url2);
}
RunTime.logVideoView = function(url,url2) {
	if(RunTime.isNullOrEmpty(url) && RunTime.isNullOrEmpty(url2)) return;
	url = RunTime.removePrefix(url);
	RunTime.log("video",RunTime.isNullOrEmpty(url) == false?url:url2);
}
RunTime.isNullOrEmpty = function(txt) {
	return txt == null || txt == "" || txt == "undefined";
}
RunTime.logAudioView = function(url) {
	if(url == null || url == "") return;
	url = RunTime.removePrefix(url);
	RunTime.log("audio",url);
}
RunTime.logSearch = function(keyword) {
	if(keyword == null || keyword == "") return;
	RunTime.log("search",keyword);
}
RunTime.removePrefix = function(url) {
	if(url == null || url == "") return url; else if(url.indexOf("http") == 0) return url; else {
		var i = url.lastIndexOf("/");
		return HxOverrides.substr(url,i + 1,null);
	}
}
RunTime.readLocalBookmarks = function() {
	var bookmarks = new Array();
	var i = 0;
	var _g1 = 0, _g = localStorage.length;
	while(_g1 < _g) {
		var i1 = _g1++;
		var szKey = localStorage.key(i1);
		if(szKey.indexOf(RunTime.kvPrex) == 0) {
			if(szKey.indexOf("@$bm$@") != -1) {
				var bookmark = new core.Bookmark();
				bookmark.fillData(szKey,localStorage.getItem(szKey));
				bookmarks.push(bookmark);
				RunTime.book.bookmarks.push(bookmark);
			}
		}
	}
	return bookmarks;
}
RunTime.readLocalHighLights = function() {
	var highlights = new Array();
	var i = 0;
	var _g1 = 0, _g = localStorage.length;
	while(_g1 < _g) {
		var i1 = _g1++;
		var szKey = localStorage.key(i1);
		if(szKey.indexOf(RunTime.kvPrex) == 0) {
			if(szKey.indexOf("@$ht$@") != -1) {
				var highlight = new core.HighLight();
				highlight.fillData(szKey,localStorage.getItem(szKey));
				highlights.push(highlight);
				RunTime.book.highlights.push(highlight);
			}
		}
	}
	RunTime.highLights = highlights;
	if(RunTime.flipBook != null) {
		RunTime.flipBook.loadCtxHighLights();
		RunTime.flipBook.bookContext.render();
	}
	return highlights;
}
RunTime.updateHighLightNote = function(text,color) {
	if(RunTime.currentHighLight != null) {
		RunTime.currentHighLight.updateText(text,color);
		RunTime.flipBook.resetHighlightButton();
		RunTime.flipBook.bookContext.render();
	}
}
RunTime.deleteHighLight = function() {
	if(RunTime.currentHighLight != null) {
		RunTime.currentHighLight.remove();
		HxOverrides.remove(RunTime.book.highlights,RunTime.currentHighLight);
		RunTime.currentHighLight = null;
		RunTime.flipBook.loadCtxHighLights();
		RunTime.flipBook.bookContext.render();
		RunTime.flipBook.resetHighlightButton();
	}
}
RunTime.readLocalNotes = function() {
	var notes = new Array();
	var i = 0;
	var _g1 = 0, _g = localStorage.length;
	while(_g1 < _g) {
		var i1 = _g1++;
		var szKey = localStorage.key(i1);
		if(szKey.indexOf(RunTime.kvPrex) == 0) {
			if(szKey.indexOf("@$ni$@") != -1) {
				var note = new core.NoteIcon();
				note.fillData(szKey,localStorage.getItem(szKey));
				notes.push(note);
				RunTime.book.notes.push(note);
			}
		}
	}
	RunTime.notes = notes;
	if(RunTime.flipBook != null) {
		RunTime.flipBook.loadCtxNotes();
		RunTime.flipBook.bookContext.render();
	}
	return notes;
}
RunTime.updateNote = function(text) {
	if(RunTime.currentNote != null) {
		RunTime.currentNote.updateText(text);
		RunTime.flipBook.resetNoteButton();
	}
}
RunTime.deleteNote = function() {
	if(RunTime.currentNote != null) {
		RunTime.currentNote.remove();
		HxOverrides.remove(RunTime.book.notes,RunTime.currentNote);
		RunTime.currentNote = null;
		RunTime.flipBook.loadCtxNotes();
		RunTime.flipBook.bookContext.render();
		RunTime.flipBook.resetNoteButton();
	}
}
RunTime.showDebugMsg = function(msg) {
	var div = js.Lib.document.createElement("div");
	div.style.position = "absolute";
	div.style.zIndex = 9999;
	div.style.background = "white";
	div.style.border = "1px solid #000";
	div.style.display = "block";
	var debugTimer = new haxe.Timer(300);
	debugTimer.run = function() {
		div.style.top = "100px";
		div.style.left = "100px";
		div.innerHTML = "" + Std.string(msg);
		js.Lib.document.body.appendChild(div);
	};
}
RunTime.resizeSlide = function(p1,p2,p3,p4,p5) {
	var scale = p3 / p1.height;
	var leftVal = (p2 - p1.width * scale) / 2;
	js.Lib.document.getElementById(p4).style.width = (p1.width * scale | 0) + "px";
	js.Lib.document.getElementById(p4).style.marginLeft = leftVal + "px";
}
var Std = function() { }
Std.__name__ = true;
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	return x | 0;
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	toString: function() {
		return this.b;
	}
	,addSub: function(s,pos,len) {
		this.b += HxOverrides.substr(s,pos,len);
	}
	,addChar: function(c) {
		this.b += String.fromCharCode(c);
	}
	,add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c >= 9 && c <= 13 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += HxOverrides.substr(c,0,l - sl);
		sl = l;
	} else {
		s += c;
		sl += cl;
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		ns += HxOverrides.substr(c,0,l - sl);
		sl = l;
	} else {
		ns += c;
		sl += cl;
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
}
StringTools.isEOF = function(c) {
	return c != c;
}
var XMLHttpRequestResponseType = { __ename__ : true, __constructs__ : ["arraybuffer","blob","document","json","text"] }
XMLHttpRequestResponseType.arraybuffer = ["arraybuffer",0];
XMLHttpRequestResponseType.arraybuffer.toString = $estr;
XMLHttpRequestResponseType.arraybuffer.__enum__ = XMLHttpRequestResponseType;
XMLHttpRequestResponseType.blob = ["blob",1];
XMLHttpRequestResponseType.blob.toString = $estr;
XMLHttpRequestResponseType.blob.__enum__ = XMLHttpRequestResponseType;
XMLHttpRequestResponseType.document = ["document",2];
XMLHttpRequestResponseType.document.toString = $estr;
XMLHttpRequestResponseType.document.__enum__ = XMLHttpRequestResponseType;
XMLHttpRequestResponseType.json = ["json",3];
XMLHttpRequestResponseType.json.toString = $estr;
XMLHttpRequestResponseType.json.__enum__ = XMLHttpRequestResponseType;
XMLHttpRequestResponseType.text = ["text",4];
XMLHttpRequestResponseType.text.toString = $estr;
XMLHttpRequestResponseType.text.__enum__ = XMLHttpRequestResponseType;
var Xml = function() {
};
Xml.__name__ = true;
Xml.parse = function(str) {
	return haxe.xml.Parser.parse(str);
}
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new Hash();
	r.setNodeName(name);
	return r;
}
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.setNodeValue(data);
	return r;
}
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.setNodeValue(data);
	return r;
}
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.setNodeValue(data);
	return r;
}
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.setNodeValue(data);
	return r;
}
Xml.createProlog = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Prolog;
	r.setNodeValue(data);
	return r;
}
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
}
Xml.prototype = {
	toString: function() {
		if(this.nodeType == Xml.PCData) return this._nodeValue;
		if(this.nodeType == Xml.CData) return "<![CDATA[" + this._nodeValue + "]]>";
		if(this.nodeType == Xml.Comment) return "<!--" + this._nodeValue + "-->";
		if(this.nodeType == Xml.DocType) return "<!DOCTYPE " + this._nodeValue + ">";
		if(this.nodeType == Xml.Prolog) return "<?" + this._nodeValue + "?>";
		var s = new StringBuf();
		if(this.nodeType == Xml.Element) {
			s.b += Std.string("<");
			s.b += Std.string(this._nodeName);
			var $it0 = this._attributes.keys();
			while( $it0.hasNext() ) {
				var k = $it0.next();
				s.b += Std.string(" ");
				s.b += Std.string(k);
				s.b += Std.string("=\"");
				s.b += Std.string(this._attributes.get(k));
				s.b += Std.string("\"");
			}
			if(this._children.length == 0) {
				s.b += Std.string("/>");
				return s.b;
			}
			s.b += Std.string(">");
		}
		var $it1 = this.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			s.b += Std.string(x.toString());
		}
		if(this.nodeType == Xml.Element) {
			s.b += Std.string("</");
			s.b += Std.string(this._nodeName);
			s.b += Std.string(">");
		}
		return s.b;
	}
	,insertChild: function(x,pos) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.splice(pos,0,x);
	}
	,removeChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		var b = HxOverrides.remove(this._children,x);
		if(b) x._parent = null;
		return b;
	}
	,addChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.push(x);
	}
	,firstElement: function() {
		if(this._children == null) throw "bad nodetype";
		var cur = 0;
		var l = this._children.length;
		while(cur < l) {
			var n = this._children[cur];
			if(n.nodeType == Xml.Element) return n;
			cur++;
		}
		return null;
	}
	,firstChild: function() {
		if(this._children == null) throw "bad nodetype";
		return this._children[0];
	}
	,elementsNamed: function(name) {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				if(n.nodeType == Xml.Element && n._nodeName == name) break;
				k++;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				k++;
				if(n.nodeType == Xml.Element && n._nodeName == name) {
					this.cur = k;
					return n;
				}
			}
			return null;
		}};
	}
	,elements: function() {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				if(this.x[k].nodeType == Xml.Element) break;
				k += 1;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				k += 1;
				if(n.nodeType == Xml.Element) {
					this.cur = k;
					return n;
				}
			}
			return null;
		}};
	}
	,iterator: function() {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			return this.cur < this.x.length;
		}, next : function() {
			return this.x[this.cur++];
		}};
	}
	,attributes: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.keys();
	}
	,exists: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.exists(att);
	}
	,remove: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.remove(att);
	}
	,set: function(att,value) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.set(att,value);
	}
	,get: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.get(att);
	}
	,getParent: function() {
		return this._parent;
	}
	,setNodeValue: function(v) {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue = v;
	}
	,getNodeValue: function() {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue;
	}
	,setNodeName: function(n) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName = n;
	}
	,getNodeName: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName;
	}
	,__class__: Xml
}
var Xml2Html = function() {
};
Xml2Html.__name__ = true;
Xml2Html.prototype = {
	prepareXmlAsHtml: function(txt) {
		this.map = new Array();
		txt = StringTools.replace(txt,"<![CDATA[","]]>");
		var lines = txt.split("]]>");
		if(lines.length == 0) return txt;
		var buff = new StringBuf();
		var k = 0;
		var _g1 = 0, _g = lines.length;
		while(_g1 < _g) {
			var i = _g1++;
			var val = lines[i];
			if(i % 2 == 0) buff.b += Std.string(val); else {
				var key = Std.string(k);
				buff.b += Std.string("<cdata>" + key + "</cdata>");
				var cdata = new CData();
				cdata.key = key;
				cdata.val = val;
				this.map.push(cdata);
				k++;
			}
		}
		return buff.b;
	}
	,getCData: function(key) {
		if(this.map == null) return null;
		var _g1 = 0, _g = this.map.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = this.map[i];
			if(item.key == key) return item.val;
		}
		return null;
	}
	,__class__: Xml2Html
}
var Zoom = function() { }
Zoom.__name__ = true;
Zoom.getContext = function() {
	return Zoom.cvsZoom.getContext("2d");
}
Zoom.Load = function() {
	Zoom.cvsZoomDom = js.Lib.document.getElementById("cvsZoom");
	Zoom.mask = js.Lib.document.getElementById("mask");
	Zoom.maskPopup = js.Lib.document.getElementById("maskPopup");
	Zoom.maskPopup.onclick = Zoom.forbidden;
	Zoom.maskPopup.ondblclick = Zoom.onDblClick;
	Zoom.maskPopup.ontouchstart = Zoom.forbidden;
	Zoom.maskPopup.ontouchmove = Zoom.forbidden;
	Zoom.maskPopup.ontouchend = Zoom.forbidden;
	Zoom.maskPopup.ontouchcancel = Zoom.forbidden;
	Zoom.maskPopup.gestureend = Zoom.forbidden;
	Zoom.maskPopup.gesturestart = Zoom.forbidden;
	Zoom.maskPopup.gesturechange = Zoom.forbidden;
	Zoom.maskPopup.onscroll = Zoom.forbidden;
	Zoom.maskPopup.onmousewheel = Zoom.forbidden;
	Zoom.mask.ondblclick = Zoom.onDblClick;
	var dy = Zoom.cvsZoomDom;
	Zoom.cvsZoom = dy;
	Zoom.mask.ontouchstart = Zoom.onZoom;
	Zoom.clientWidth = js.Lib.window.document.body.clientWidth;
	Zoom.clientHeight = js.Lib.window.document.body.clientHeight;
	RunTime.clientWidth = Zoom.clientWidth;
	RunTime.clientHeight = Zoom.clientHeight;
	var params = orc.utils.Util.getUrlParams();
	var _g1 = 0, _g = params.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = params[i];
		if(item.key == "img") Zoom.imgSrc = item.value; else if(item.key == "bookId") Zoom.bookId = item.value; else if(item.key == "page") Zoom.pageNum = item.value; else if(item.key == "pw") Zoom.pageWidth = Std.parseFloat(item.value); else if(item.key == "ph") Zoom.pageHeight = Std.parseFloat(item.value); else if(item.key == "bookTitle") {
			Zoom.bookTitle = item.value;
			Zoom.bookTitle = StringTools.urlDecode(Zoom.bookTitle);
		} else if(item.key == "bbv") Zoom.bbv = item.value; else if(item.key == "ua") Zoom.analyticsUA = item.value; else if(item.key == "pcode") Zoom.pcode = item.value;
	}
	js.Lib.document.title = Zoom.bookTitle + " - Page " + Std.string(Std.parseInt(Zoom.pageNum) + 1);
	Zoom.img = new core.Html5Image(Zoom.imgSrc,Zoom.onLoadImage);
	RunTime.useAnalyticsUA(Zoom.analyticsUA,Zoom.bookId);
	RunTime.logPageView(Std.parseInt(Zoom.pageNum) + 1);
}
Zoom.forbidden = function(e) {
	e.stopPropagation();
}
Zoom.onLoadImage = function() {
	var w = Zoom.img.image.width;
	var h = Zoom.img.image.height;
	Zoom.cvsZoom.width = Math.max(Zoom.pageWidth,Math.max(w,Zoom.clientWidth)) | 0;
	Zoom.cvsZoom.height = Math.max(Zoom.pageHeight,Math.max(h,Zoom.clientHeight)) | 0;
	Zoom.mask.style.width = Std.string(Zoom.cvsZoom.width) + "px";
	Zoom.mask.style.height = Std.string(Zoom.cvsZoom.height) + "px";
	Zoom.xOffset = 0.5 * (Zoom.cvsZoom.width - Math.max(Zoom.img.image.width,Zoom.pageWidth));
	Zoom.yOffset = 0.5 * (Zoom.cvsZoom.height - Math.max(Zoom.img.image.height,Zoom.pageHeight));
	Zoom.xScale = w / Zoom.pageWidth;
	Zoom.yScale = h / Zoom.pageHeight;
	Zoom.draw();
	RunTime.requestHotlinks(Zoom.loadHotlinks);
	RunTime.requestButtons(Zoom.loadButtons);
	RunTime.requestVideos(Zoom.loadVideos);
}
Zoom.draw = function() {
	var ctx = Zoom.getContext();
	var dp = Zoom.getDrawParams();
	ctx.drawImage(Zoom.img.image,dp.sx,dp.sy,dp.sw,dp.sh,dp.dx,dp.dy,dp.dw,dp.dh);
}
Zoom.getDrawParams = function() {
	var dp = new core.DrawParams();
	dp.sx = 0;
	dp.sy = 0;
	dp.sw = Zoom.img.image.width;
	dp.sh = Zoom.img.image.height;
	dp.dx = Zoom.xOffset;
	dp.dy = Zoom.yOffset;
	dp.dw = Math.max(Zoom.pageWidth,dp.sw);
	dp.dh = Math.max(Zoom.pageHeight,dp.sh);
	return dp;
}
Zoom.loadHotlinks = function() {
	var list = RunTime.book.hotlinks;
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = list[i];
		if(Std.string(item.pageNum) == Zoom.pageNum) Zoom.hotlinks.push(item);
	}
	Zoom.renderHotlinks();
}
Zoom.loadVideos = function() {
	var list = RunTime.book.videos;
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = list[i];
		if(Std.string(item.pageNum) == Zoom.pageNum) Zoom.videos.push(item);
	}
	Zoom.renderVideos();
}
Zoom.loadButtons = function() {
	var list = RunTime.book.buttons;
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = list[i];
		if(Std.string(item.pageNum) == Zoom.pageNum) Zoom.buttons.push(item);
	}
	Zoom.renderButtons();
}
Zoom.renderHotlinks = function() {
	var list = Zoom.hotlinks;
	var ctx = Zoom.getContext();
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = list[i];
		Zoom.renderHotlink(ctx,item);
	}
}
Zoom.renderHotlink = function(ctx,link) {
	link.loadToRect(ctx,Zoom.xOffset + link.x * Zoom.xScale,Zoom.yOffset + link.y * Zoom.yScale,link.width * Zoom.xScale,link.height * Zoom.yScale);
}
Zoom.renderVideos = function() {
	var dom = js.Lib.document.getElementById("cvsVideo");
	var _g1 = 0, _g = Zoom.videos.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = Zoom.videos[i];
		item.x = item.x * Zoom.xScale;
		if(item.youtubeId == null || item.youtubeId == "") dom.innerHTML += core.HtmlHelper.toRectVideoHtml(item,Zoom.xOffset + item.x * Zoom.xScale,Zoom.yOffset + item.y * Zoom.yScale,item.width * Zoom.xScale,item.height * Zoom.yScale); else dom.innerHTML += core.HtmlHelper.toRectYoutubeVideoHtml(item,Zoom.xOffset + item.x * Zoom.xScale,Zoom.yOffset + item.y * Zoom.yScale,item.width * Zoom.xScale,item.height * Zoom.yScale);
	}
}
Zoom.renderButtons = function() {
	var list = Zoom.buttons;
	var ctx = Zoom.getContext();
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = list[i];
		item.loadToContext2DRect(ctx,Zoom.xOffset + item.x * Zoom.xScale,Zoom.yOffset + item.y * Zoom.yScale,item.width * Zoom.xScale,item.height * Zoom.yScale);
	}
}
Zoom.onDblClick = function(e) {
	Zoom.zoomOut();
}
Zoom.onZoom = function(e) {
	var date = new Date();
	if(Zoom.lastTouchTime != null) {
		var lastTime = Zoom.lastTouchTime.getTime();
		var newTime = date.getTime();
		if(newTime - lastTime < RunTime.doubleClickIntervalMs) {
			Zoom.lastTouchTime = null;
			Zoom.zoomOut();
			return;
		}
	}
	Zoom.lastTouchTime = date;
	var obj = e;
	var touch = obj.touches[0];
	if(obj.touches.length > 1) Zoom.zoomOut(); else Zoom.onClick(e);
}
Zoom.zoomOut = function(num) {
	if(num == null) num = -1;
	if(num == -1 || num == null) num = Std.parseInt(Zoom.pageNum);
	js.Lib.window.location.href = RunTime.urlIndex + "?page=" + Std.string(num) + "&bbv=" + Zoom.bbv + "&pcode=" + Zoom.pcode;
}
Zoom.onClick = function(e) {
	var match = null;
	var list = Zoom.hotlinks;
	var obj = e;
	var touch = obj.touches[0];
	var xx = touch.screenX;
	var yy = touch.screenY;
	Zoom.popupXOffset = xx - touch.clientX;
	Zoom.popupYOffset = yy - touch.clientY;
	var _g1 = 0, _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		var link = list[i];
		if(xx >= Zoom.xOffset + link.x * Zoom.xScale && xx <= Zoom.xOffset + link.x * Zoom.xScale + link.width * Zoom.xScale && yy >= Zoom.yOffset + link.y * Zoom.yScale && yy <= Zoom.yOffset + link.y * Zoom.yScale + link.height * Zoom.yScale) {
			match = link;
			break;
		}
	}
	Zoom.invokeClickHotlink(match);
	var matchButton = null;
	var _g1 = 0, _g = Zoom.buttons.length;
	while(_g1 < _g) {
		var i = _g1++;
		var button = Zoom.buttons[i];
		if(xx >= Zoom.xOffset + button.x * Zoom.xScale && xx <= Zoom.xOffset + button.x * Zoom.xScale + button.width * Zoom.xScale && yy >= Zoom.yOffset + button.y * Zoom.yScale && yy <= Zoom.yOffset + button.y * Zoom.yScale + button.height * Zoom.yScale) {
			matchButton = button;
			break;
		}
	}
	Zoom.invokeClickButton(matchButton);
}
Zoom.invokeClickHotlink = function(link) {
	if(link == null) return;
	link.click(Zoom.popupXOffset,Zoom.popupYOffset);
}
Zoom.invokeClickButton = function(item) {
	if(item == null) return;
	item.click(Zoom.popupXOffset,Zoom.popupYOffset);
}
core.AudioInfo = function() {
	this.pageNum = -1;
	this.url = "";
	this.id = "";
};
core.AudioInfo.__name__ = true;
core.AudioInfo.prototype = {
	__class__: core.AudioInfo
}
core.BookContext = function() {
	this.pages = new Array();
	this.pageOffset = 0;
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
};
core.BookContext.__name__ = true;
core.BookContext.prototype = {
	getNoteAt: function(x,y) {
		if(this.notes == null) return null;
		var _g1 = 0, _g = this.notes.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = this.notes[i];
			if(item.hitTest(x,y) == true) return item;
		}
		return null;
	}
	,getNotePosition: function() {
		return this.notes[0];
	}
	,getHighLightAt: function(x,y) {
		if(this.highlights == null) return null;
		var _g1 = 0, _g = this.highlights.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = this.highlights[i];
			if(item.hitTest(x,y) == true) return item;
		}
		return null;
	}
	,getButtonAt: function(x,y) {
		if(this.buttons == null) return null;
		var _g1 = 0, _g = this.buttons.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = this.buttons[i];
			if(item.hitTest(x,y) == true) return item;
		}
		return null;
	}
	,getHotLinkAt: function(x,y) {
		if(this.hotlinks == null) return null;
		var _g1 = 0, _g = this.hotlinks.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = this.hotlinks[i];
			if(item.hitTest(x,y) == true) return item;
		}
		return null;
	}
	,render: function() {
		this.clear();
		if(this.pages != null && this.ctx != null) {
			var _g1 = 0, _g = this.pages.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.pages[i];
				item.scale = this.scale;
				item.offsetX = this.offsetX;
				item.offsetY = this.offsetY;
				item.visible = true;
				item.loadToContext2D(this.ctx);
			}
		}
		if(this.hotlinks != null && this.ctx != null) {
			var _g1 = 0, _g = this.hotlinks.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.hotlinks[i];
				item.scale = this.scale;
				item.offsetX = this.offsetX;
				item.offsetY = this.offsetY;
				item.loadToContext2D(this.ctxButton);
			}
		}
		if(this.buttons != null && this.ctxButton != null) {
			var _g1 = 0, _g = this.buttons.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.buttons[i];
				item.scale = this.scale;
				item.offsetX = this.offsetX;
				item.offsetY = this.offsetY;
				item.loadToContext2D(this.ctxButton);
			}
		}
		if(this.highlights != null && this.ctxHighLight != null) {
			var _g1 = 0, _g = this.highlights.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.highlights[i];
				item.scale = this.scale;
				item.offsetX = this.offsetX;
				item.offsetY = this.offsetY;
				item.loadToContext2D(this.ctxHighLight);
			}
		}
		if(this.notes != null && this.ctxNote != null) {
			var _g1 = 0, _g = this.notes.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.notes[i];
				item.scale = this.scale;
				item.offsetX = this.offsetX;
				item.offsetY = this.offsetY;
				item.loadToContext2D(this.ctxNote);
			}
		}
		if(this.bookmarks != null && this.bookmarks.length > 0) {
			var _g1 = 0, _g = this.bookmarks.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.bookmarks[i];
				item.loadToContext2D(this.ctxBookmark);
			}
		}
	}
	,addPage: function(page) {
		if(page == null) return;
		if(this.pages == null) this.pages = new Array();
		page.bookContext = this;
		this.pages.push(page);
	}
	,clear: function(removePages) {
		if(removePages == null) removePages = false;
		if(this.pages != null) {
			var _g1 = 0, _g = this.pages.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.pages[i];
				item.visible = false;
			}
		}
		if(removePages == true) this.pages = new Array();
		if(this.ctx != null) this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
		if(this.ctxButton != null) this.ctxButton.clearRect(0,0,this.ctxButton.canvas.width,this.ctxButton.canvas.height);
		if(this.ctxHighLight != null) this.ctxHighLight.clearRect(0,0,this.ctxHighLight.canvas.width,this.ctxHighLight.canvas.height);
		if(this.ctxNote != null) this.ctxNote.clearRect(0,0,this.ctxNote.canvas.width,this.ctxNote.canvas.height);
		if(this.ctxBookmark != null) this.ctxBookmark.clearRect(0,0,this.ctxBookmark.canvas.width,this.ctxBookmark.canvas.height);
	}
	,removeAllPages: function() {
		if(this.pages != null) {
			var _g1 = 0, _g = this.pages.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = this.pages[i];
				item.visible = false;
			}
		}
		this.pages = new Array();
	}
	,resetLayoutParams: function() {
		this.offsetX = 0;
		this.offsetY = 0;
		this.scale = 1;
	}
	,getPageCount: function() {
		return this.pages.length;
	}
	,__class__: core.BookContext
}
core.Bookmark = function() {
	this.onlyread = false;
	var _g = this;
	this.bookmarkImg = js.Lib.document.createElement("img");
	this.bookmarkImg.onload = function() {
		_g.bookImgLoaded = true;
	};
	this.bookmarkImg.src = RunTime.urlRoot + "content/images/bookmark.png";
};
core.Bookmark.__name__ = true;
core.Bookmark.prototype = {
	loadToContext2D: function(ctx) {
		if(ctx != null && this.bookImgLoaded) {
			ctx.save();
			ctx.drawImage(this.bookmarkImg,(RunTime.clientWidth | 0) - 40,52);
			ctx.restore();
		}
	}
	,clone: function() {
		var bookmark = new core.Bookmark();
		bookmark.guid = this.guid;
		bookmark.pageNum = this.pageNum;
		bookmark.text = this.text;
		return bookmark;
	}
	,remove: function() {
		localStorage.removeItem(this.guid);
	}
	,fillData: function(guid,json) {
		var objJSON = JSON.parse(json);
		this.pageNum = Std.parseInt(objJSON.obj[0].pageNum);
		this.text = objJSON.obj[0].text;
		this.guid = guid;
	}
	,save: function() {
		this.guid = RunTime.kvPrex + "@$bm$@" + new Date().getTime();
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,toJSONString: function() {
		var json = "{\"obj\":[{\"pageNum\":\"" + this.pageNum + "\",\"text\":\"" + this.text + "\"}]}";
		return json;
	}
	,__class__: core.Bookmark
}
core.ButtonInfo = function() {
	this.target = "_blank";
	this.window_color = "#333333";
	this.fontSize = "12";
	this.fontColor = "#ffffff";
	this.text = "";
	this.layer = "onpage";
	this.pageLayoutType = 0;
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
};
core.ButtonInfo.__name__ = true;
core.ButtonInfo.prototype = {
	click: function(popupXOffset,popupYOffset) {
		if(popupYOffset == null) popupYOffset = 0;
		if(popupXOffset == null) popupXOffset = 0;
		switch(this.type) {
		case "":
			if(this.destination != null) {
				if(this.destination.indexOf("page:") == 0) {
					var val = HxOverrides.substr(this.destination,5,null);
					var num = Std.parseInt(val);
					if(RunTime.flipBook != null) RunTime.flipBook.turnToPage(num - 1); else Zoom.zoomOut(num - 1);
				} else if(this.destination.indexOf("mailto:") == 0) {
					RunTime.logClickLink(this.destination);
					js.Lib.window.location.href = this.destination;
				} else if(this.destination.indexOf("fun:") == 0) {
					var fun = HxOverrides.substr(this.destination,4,null);
					if(fun == "content") RunTime.flipBook.onContentsClick(null); else if(fun == "thumb") RunTime.flipBook.onThumbsClick(null); else if(fun == "showtxt") RunTime.flipBook.onShowTxtClick(null); else if(fun == "highlight") RunTime.flipBook.onButtonMaskClick(null); else if(fun == "bookmark") RunTime.flipBook.onButtonBookmark(null); else if(fun == "notes") RunTime.flipBook.onButtonNoteClick(null); else if(fun == "autoflip") RunTime.flipBook.onAutoFlipClick(null); else if(fun == "download") RunTime.onDownloadClick(null); else if(fun == "fliptofront") RunTime.flipBook.turnToFirstPage(null); else if(fun == "flipleft") RunTime.flipBook.turnToPrevPage(null); else if(fun == "flipright") RunTime.flipBook.turnToNextPage(null); else if(fun == "fliptoback") RunTime.flipBook.turnToLastPage(null);
				} else {
					RunTime.logClickLink(this.destination);
					if("_self" == this.target) js.Lib.window.location.href = this.destination; else js.Lib.window.open(this.destination,this.target);
				}
			}
			break;
		case "image":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			core.HtmlHelper.toPopupImageHtml(this,function(txt) {
				js.Lib.document.getElementById("cvsOthers").innerHTML = txt;
				js.Lib.document.getElementById("popupImage").style.cssText += " -moz-transform: scale(1);-moz-transition:width  2s ease-out;-webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			});
			RunTime.logClickLink(this.destination);
			break;
		case "video":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupVideoHtml(this);
			js.Lib.document.getElementById("popupVideo").style.cssText += " -moz-transform: scale(1);-moz-transition:width  2s ease-out; -webkit-transform: scale(1);-webkit-transition: 0.5s ease-out; ";
			RunTime.playVideo();
			RunTime.logVideoView(this.destination,this.youtubeId);
			break;
		case "audio":
			RunTime.flipBook.showPopupAudio(this);
			RunTime.logAudioView(this.destination);
			RunTime.playAudio();
			break;
		case "message":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupHtml(this);
			js.Lib.document.getElementById("popupMessage").style.cssText += " -moz-transform: scale(1);-moz-transition:width  2s ease-out; -webkit-transform: scale(1);-webkit-transition: 0.5s ease-out; ";
			break;
		case "message-hover":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupHtml(this);
			js.Lib.document.getElementById("popupMessage").style.cssText += "-moz-transform: scale(1); -moz-transition:width 2s ease-out; -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			break;
		}
	}
	,hitTest: function(mouseX,mouseY) {
		if(this.type == "none") return false;
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		haxe.Log.trace("mouseX=" + mouseX + ",mouseY=" + mouseY,{ fileName : "ButtonInfo.hx", lineNumber : 158, className : "core.ButtonInfo", methodName : "hitTest"});
		var result = mouseX >= xx && mouseY >= yy && mouseX <= xx + ww && mouseY <= yy + hh;
		return result;
	}
	,loadToRect: function(ctx,x,y,w,h) {
		if(w > 0 && h > 0) {
			if(this.text == "") ctx.drawImage(this._imagePage,0,0,this._imagePage.width,this._imagePage.height,x,y,w,h); else {
				ctx.save();
				ctx.fillStyle = this.fontColor;
				ctx.font = this.fontSize + "px " + "san-serif";
				ctx.fillText(this.text,x,y + 30);
				ctx.restore();
			}
		}
	}
	,loadToContext2DRect: function(ctx,x,y,w,h) {
		this.ctx = ctx;
		if(this._imagePage == null) {
			var self = this;
			this.getImagePage(function() {
				self.loaded = true;
				self.loadToContext2DRect(self.ctx,self.x,self.y,self.width,self.height);
			});
		}
		if(this.loaded == true) this.loadToRect(ctx,x,y,this.width,this.height);
	}
	,loadToContext2D: function(ctx) {
		this.ctx = ctx;
		if(this._imagePage == null) {
			var self = this;
			this.getImagePage(function() {
				self.loaded = true;
				self.loadToContext2D(self.ctx);
			});
		}
		if(this.loaded == true) {
			var dp = this.getDrawParams();
			var v = 1;
			if(RunTime.book.pageWidth >= 1541) v = 1.7;
			var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw * v);
			var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh * v);
			var ww = this.width * (dp.dw / dp.sw * v);
			var hh = this.height * (dp.dh / dp.sh * v);
			this.loadToRect(ctx,xx,yy,ww,hh);
		}
	}
	,getImagePage: function(onloadFunc) {
		if(this._imagePage != null) return this._imagePage;
		var img = new Image();
		img.src = this.image;
		img.onload = onloadFunc;
		this._imagePage = img;
		return this._imagePage;
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		if(this.pageLayoutType == 2) dp = RunTime.getGolobaDrawParams();
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,__class__: core.ButtonInfo
}
core.DrawParams = function() {
};
core.DrawParams.__name__ = true;
core.DrawParams.prototype = {
	sliceRight: function(ratio,xOffset) {
		if(xOffset == null) xOffset = 0;
		if(ratio < 0) ratio = 0; else if(ratio > 1) ratio = 1;
		var dp = new core.DrawParams();
		dp.sx = this.sx + this.sw * (1 - ratio);
		dp.sy = this.sy;
		dp.dx = this.dx + this.dw * (1 - ratio) + xOffset;
		dp.dy = this.dy;
		dp.sw = this.sw * ratio;
		dp.sh = this.sh;
		dp.dw = this.dw * ratio;
		dp.dh = this.dh;
		return dp;
	}
	,sliceLeft: function(ratio,xOffset) {
		if(xOffset == null) xOffset = 0;
		if(ratio < 0) ratio = 0; else if(ratio > 1) ratio = 1;
		var dp = new core.DrawParams();
		dp.sx = this.sx;
		dp.sy = this.sy;
		dp.dx = this.dx + xOffset;
		dp.dy = this.dy;
		dp.sw = this.sw * ratio;
		dp.sh = this.sh;
		dp.dw = this.dw * ratio;
		dp.dh = this.dh;
		haxe.Log.trace("x: " + dp.dw + " y:" + dp.dh,{ fileName : "DrawParams.hx", lineNumber : 127, className : "core.DrawParams", methodName : "sliceLeft"});
		return dp;
	}
	,toString2: function() {
		return "x: " + Std.string(this.sx | 0) + ", y:" + Std.string(this.sy | 0) + ", w:" + Std.string(this.sw | 0) + ", h:" + Std.string(this.sh | 0) + ", x2:" + Std.string(this.dx | 0) + ", y2:" + Std.string(this.dy | 0) + ", w2:" + Std.string(this.dw | 0) + ", h2:" + Std.string(this.dh | 0);
	}
	,toString: function() {
		return Std.string(this.sx) + "," + Std.string(this.sy) + "," + Std.string(this.sw) + "," + Std.string(this.sh) + "," + Std.string(this.dx) + "," + Std.string(this.dy) + "," + Std.string(this.dw) + "," + Std.string(this.dh);
	}
	,applyTransform: function(scale,offsetX,offsetY) {
		this.dx = this.dx * scale + offsetX;
		this.dy = this.dy * scale + offsetY;
		this.dw = this.dw * scale;
		this.dh = this.dh * scale;
	}
	,clone: function() {
		var dw = new core.DrawParams();
		dw.sx = this.sx;
		dw.sy = this.sy;
		dw.sw = this.sw;
		dw.sh = this.sh;
		dw.dx = this.dx;
		dw.dy = this.dy;
		dw.dw = this.dw;
		dw.dh = this.dh;
		return dw;
	}
	,scaleY: function() {
		return this.dh / this.sh;
	}
	,scaleX: function() {
		return this.dw / this.sw;
	}
	,dhi: function() {
		return Math.round(this.dh);
	}
	,dwi: function() {
		return Math.round(this.dw);
	}
	,dyi: function() {
		return Math.round(this.dy);
	}
	,dxi: function() {
		return Math.round(this.dx);
	}
	,__class__: core.DrawParams
}
core.HighLight = function() {
	this.note = new core.Note();
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.pageNum = -1;
	this.guid = "";
	this.color = "";
	this.checked = false;
	this.pageLayoutType = 0;
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
};
core.HighLight.__name__ = true;
core.HighLight.prototype = {
	click: function(popupXOffset,popupYOffset) {
		if(popupYOffset == null) popupYOffset = 0;
		if(popupXOffset == null) popupXOffset = 0;
		RunTime.showPopupMaskLayer();
		RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
		js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toHighLightPopupHtml(this,"saveHighlightNote","deleteHighlightNote");
		js.Lib.document.getElementById("textNote").focus();
	}
	,hitTest: function(mouseX,mouseY) {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		var result = mouseX >= xx && mouseY >= yy && mouseX <= xx + ww && mouseY <= yy + hh;
		return result;
	}
	,draw: function(context) {
		var radius = 5;
		context.save();
		this.color = "rgba(255,0,0,0.4)";
		context.fillStyle = this.color;
		context.fillRect(this.tx | 0,this.ty | 0,this.twidth | 0,this.theight | 0);
		context.restore();
		if(this.note != null) {
			this.note.x = this.tx;
			this.note.y = this.ty - this.note.image.height;
			this.note.draw();
		}
	}
	,loadToContext2D: function(context) {
		var radius = 5;
		context.save();
		if(this.color != "") context.fillStyle = this.color; else context.fillStyle = "rgba(0,255,0,0.4)";
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		context.fillRect(xx | 0,yy | 0,ww | 0,hh | 0);
		context.restore();
		if(this.note != null) {
			this.note.x = this.x;
			this.note.y = this.y - this.note.image.height;
			this.note.draw();
		}
	}
	,remove: function() {
		localStorage.removeItem(this.guid);
	}
	,updateText: function(text,color) {
		this.note.text = text;
		this.color = "rgba(" + color + ",0.4)";
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,setChecked: function(bChecked) {
		this.checked = bChecked;
		if(this.checked) {
		} else {
		}
	}
	,fillData: function(guid,json) {
		var objJSON = JSON.parse(json);
		this.x = Std.parseFloat(objJSON.obj[0].x);
		this.y = Std.parseFloat(objJSON.obj[0].y);
		this.width = Std.parseFloat(objJSON.obj[0].width);
		this.height = Std.parseFloat(objJSON.obj[0].height);
		this.note.text = objJSON.obj[0].note;
		this.pageNum = Std.parseInt(objJSON.obj[0].page);
		this.color = Std.string(objJSON.obj[0].color);
		this.guid = guid;
	}
	,DataTransform: function() {
		var dp = this.getDrawParams();
		this.pageNum = this.tpageNum;
		if(RunTime.singlePage) {
		} else if(RunTime.book.rightToLeft) {
			if(this.tx > RunTime.clientWidth / 2) dp = this.getLeftDrawParams(); else dp = this.getRightDrawParams();
		} else if(this.tx > RunTime.clientWidth / 2) dp = this.getRightDrawParams(); else dp = this.getLeftDrawParams();
		this.x = dp.sx + (this.tx - dp.dx) / (dp.dw / dp.sw);
		this.y = dp.sy + (this.ty - dp.dy) / (dp.dh / dp.sh);
		this.width = this.twidth / (dp.dw / dp.sw);
		this.height = this.theight / (dp.dh / dp.sh);
		haxe.Log.trace("x=" + this.x + ",y=" + this.y + ",width=" + this.width + ",height=" + this.height,{ fileName : "HighLight.hx", lineNumber : 208, className : "core.HighLight", methodName : "DataTransform"});
	}
	,save: function() {
		if(this.twidth == 0 || this.theight == 0) return;
		this.guid = RunTime.kvPrex + "@$ht$@" + new Date().getTime();
		this.DataTransform();
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,toJSONString: function() {
		var json = "{\"obj\":[{\"x\":\"" + this.x + "\",\"y\":\"" + this.y + "\",\"width\":\"" + this.width + "\",\"height\":\"" + this.height + "\",\"page\":\"" + this.pageNum + "\",\"color\":\"" + this.color + "\",\"note\":\"" + this.note.text + "\"}]}";
		return json;
	}
	,getBottom: function() {
		return this.y + this.height;
	}
	,getTop: function() {
		return this.y;
	}
	,getRight: function() {
		return this.x + this.width;
	}
	,getLeft: function() {
		return this.x;
	}
	,getContext: function() {
		return this.canvas.getContext("2d");
	}
	,setCanvas: function(canvas) {
		this.canvas = canvas;
		if(this.note != null) this.note.setCanvas(this.canvas);
	}
	,clone: function() {
		this.DataTransform();
		var hl = new core.HighLight();
		hl.x = this.x;
		hl.y = this.y;
		hl.width = this.width;
		hl.height = this.height;
		hl.pageNum = this.pageNum;
		hl.guid = this.guid;
		hl.color = this.color;
		hl.note.text = this.note.text;
		return hl;
	}
	,getRightDrawParams: function() {
		var dp = RunTime.getDrawParams(1);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,getLeftDrawParams: function() {
		var dp = RunTime.getDrawParams(-1);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,__class__: core.HighLight
}
core.HotLink = function() {
	this.target = "_blank";
	this.window_color = "#333333";
	this.opacity = 0.8;
	this.pageLayoutType = 0;
	this.color = "#333333";
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
};
core.HotLink.__name__ = true;
core.HotLink.prototype = {
	click: function(popupXOffset,popupYOffset) {
		if(popupYOffset == null) popupYOffset = 0;
		if(popupXOffset == null) popupXOffset = 0;
		switch(this.type) {
		case "":
			if(this.destination != null) {
				if(this.destination.indexOf("page:") == 0) {
					var val = HxOverrides.substr(this.destination,5,null);
					var num = Std.parseInt(val);
					if(RunTime.flipBook != null) RunTime.flipBook.turnToPage(num - 1); else Zoom.zoomOut(num - 1);
				} else if(this.destination.indexOf("mailto:") == 0) {
					RunTime.logClickLink(this.destination);
					js.Lib.window.location.href = this.destination;
				} else if(this.destination.indexOf("fun:") == 0) {
					var fun = HxOverrides.substr(this.destination,4,null);
					if(fun == "content") RunTime.flipBook.onContentsClick(null); else if(fun == "thumb") RunTime.flipBook.onThumbsClick(null); else if(fun == "showtxt") RunTime.flipBook.onShowTxtClick(null); else if(fun == "highlight") RunTime.flipBook.onButtonMaskClick(null); else if(fun == "bookmark") RunTime.flipBook.onButtonBookmark(null); else if(fun == "notes") RunTime.flipBook.onButtonNoteClick(null); else if(fun == "autoflip") RunTime.flipBook.onAutoFlipClick(null); else if(fun == "download") RunTime.onDownloadClick(null); else if(fun == "fliptofront") RunTime.flipBook.turnToFirstPage(null); else if(fun == "flipleft") RunTime.flipBook.turnToPrevPage(null); else if(fun == "flipright") RunTime.flipBook.turnToNextPage(null); else if(fun == "fliptoback") RunTime.flipBook.turnToLastPage(null);
				} else {
					RunTime.logClickLink(this.destination);
					if("_self" == this.target) js.Lib.window.location.href = this.destination; else js.Lib.window.open(this.destination,this.target);
				}
			}
			break;
		case "image":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			core.HtmlHelper.toPopupImageHtml(this,function(txt) {
				js.Lib.document.getElementById("cvsOthers").innerHTML = txt;
				js.Lib.document.getElementById("popupImage").style.cssText += "-moz-transform: scale(1);-moz-transition: width 0.5s ease-out;  -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			});
			RunTime.logClickLink(this.destination);
			break;
		case "video":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupVideoHtml(this);
			js.Lib.document.getElementById("popupVideo").style.cssText += "-moz-transform: scale(1);-moz-transition: width 0.5s ease-out; -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			RunTime.playVideo();
			RunTime.logVideoView(this.destination,this.youtubeId);
			break;
		case "audio":
			RunTime.flipBook.showPopupAudio(this);
			RunTime.logAudioView(this.destination);
			RunTime.playAudio();
			break;
		case "message":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupHtml(this);
			js.Lib.document.getElementById("popupMessage").style.cssText += " -moz-transform: scale(1);-moz-transition: width 0.5s ease-out; -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			break;
		case "message-hover":
			RunTime.showPopupMaskLayer();
			RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
			js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toPopupHtml(this);
			js.Lib.document.getElementById("popupMessage").style.cssText += " -moz-transform: scale(1);-moz-transition:width  0.5s ease-out; -webkit-transform: scale(1); -webkit-transition: 0.5s ease-out; ";
			break;
		}
	}
	,hitTest: function(mouseX,mouseY) {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		var result = mouseX >= xx && mouseY >= yy && mouseX <= xx + ww && mouseY <= yy + hh;
		return result;
	}
	,loadToContext2D: function(ctx) {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		this.loadToRect(ctx,xx,yy,ww,hh);
	}
	,loadToRect: function(ctx,x,y,w,h) {
		if(w > 0 && h > 0) {
			ctx.fillStyle = orc.utils.DrawHelper.createFillStyle(this.color,this.opacity);
			ctx.fillRect(x | 0,y | 0,w | 0,h | 0);
		}
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,__class__: core.HotLink
}
core.Html5Image = function(url,onLoad) {
	this.url = url;
	this.onload = onLoad;
	this.image = new Image();
	this.image.onload = this.onload;
	this.image.src = url;
};
core.Html5Image.__name__ = true;
core.Html5Image.prototype = {
	__class__: core.Html5Image
}
core.HtmlHelper = function() { }
core.HtmlHelper.__name__ = true;
core.HtmlHelper.toContentsHtml = function(xml) {
	var roots = orc.utils.Util.getXmlChilds(xml);
	if(roots.length != 1) return "";
	var root = roots[0];
	var childs = orc.utils.Util.getXmlChilds(root);
	var s = "";
	if(childs.length > 0) {
		var _g1 = 0, _g = childs.length;
		while(_g1 < _g) {
			var i = _g1++;
			s += core.HtmlHelper.toContentsNodeHtml(childs[i],0);
		}
	}
	return s;
}
core.HtmlHelper.toContentsNodeHtml = function(xml,index) {
	var childs = orc.utils.Util.getXmlChilds(xml);
	var s = "";
	s += "<ul>";
	s += "<li>";
	s += core.HtmlHelper.toContentsNodeHtmlCore(xml,index);
	s += "</li>";
	if(childs.length > 0) {
		core.HtmlHelper.lv++;
		s += "<ul>";
		var _g1 = 0, _g = childs.length;
		while(_g1 < _g) {
			var i = _g1++;
			s += core.HtmlHelper.toContentsNodeHtml(childs[i],core.HtmlHelper.lv);
		}
		s += "</ul>";
	}
	s += "</ul>";
	return s;
}
core.HtmlHelper.toContentsNodeHtmlCore = function(xml,index) {
	var title = xml.get("title");
	var page = xml.get("page");
	var pageVal = 0;
	if(page != null && page != "") {
		pageVal = Std.parseInt(page);
		page = Std.string(pageVal - 1);
	}
	var t = "";
	if(index == 0) {
		t = "";
		core.HtmlHelper.lv = 0;
	} else {
		var _g = 0;
		while(_g < index) {
			var i = _g++;
			t += "&nbsp;&nbsp;";
		}
	}
	return "<span onclick=\"gotoPage(" + page + ");\">" + t + title + "</span>";
}
core.HtmlHelper.toSnsHtml = function(xml) {
	var roots = orc.utils.Util.getXmlChilds(xml);
	if(roots.length != 1) return "";
	var root = roots[0];
	var childs = orc.utils.Util.getXmlChilds(root);
	var s = "";
	s += "<div id='snsbox' style='float:left;width: 100%;height: 250px;'>";
	if(childs.length > 0) {
		var _g1 = 0, _g = childs.length;
		while(_g1 < _g) {
			var i = _g1++;
			s += core.HtmlHelper.toSnsNodeHtml(childs[i]);
		}
	}
	s += "</div>";
	return s;
}
core.HtmlHelper.toSnsNodeHtml = function(xml) {
	var baseUrl = js.Lib.window.location.href.split("?")[0];
	var url_array = baseUrl.split("/");
	var newUrl = "";
	if(url_array.length > 0) {
		var _g1 = 0, _g = url_array.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i != url_array.length - 1) newUrl += url_array[i] + "/";
		}
	}
	var url = xml.get("href") + newUrl;
	var s = "<p style='float:left;width:150px;height:35px;'>";
	s += "<a href='" + url + "'><img style='vertical-align:middle;' src='" + xml.get("logoUrl") + "'>" + "</a> ";
	s += "<span onclick=\"RunTime.navigateUrl('" + url + "')\" style='vertical-align:middle;'>" + xml.get("name") + "</span>";
	s += "</p>";
	return s;
}
core.HtmlHelper.toAboutHtml = function(aboutXml,bookinfoXml) {
	var aboutRoots = orc.utils.Util.getXmlChilds(aboutXml);
	if(aboutRoots.length != 1) return "";
	var aboutRoot = aboutRoots[0];
	var bookinfoRoots = orc.utils.Util.getXmlChilds(bookinfoXml);
	if(bookinfoRoots.length != 1) return "";
	var bookinfoRoot = bookinfoRoots[0];
	var logoUrl = aboutRoot.get("logo");
	var text = aboutRoot.firstChild().getNodeValue();
	var bookTitle = bookinfoRoot.get("title");
	var bookAuthor = bookinfoRoot.get("author");
	var companyName = bookinfoRoot.get("companyName");
	var companyUrl = bookinfoRoot.get("companyUrl");
	var companyAddress = bookinfoRoot.get("companyAddress");
	var companyEmail = bookinfoRoot.get("email");
	var companyTel = bookinfoRoot.get("tel");
	var l_bookTitle = L.s("BookTitle","Book Title");
	var l_bookAuthor = L.s("BookAuthor","Book Author");
	var l_companyName = L.s("CompanyName","Company Name");
	var l_companyUrl = L.s("CompanyUrl","Company Url");
	var l_companyAddress = L.s("CompanyAddress","Address");
	var l_companyEmail = L.s("CompanyEmail","Email");
	var l_companyTel = L.s("CompanyTel","Tel");
	var aboutUsText = "";
	if(bookTitle != "") aboutUsText += l_bookTitle + ":" + bookTitle + "<br />";
	if(bookAuthor != "") aboutUsText += l_bookAuthor + ":" + bookAuthor + "<br />";
	if(companyName != "") aboutUsText += l_companyName + ":" + companyName + "<br />";
	if(companyUrl != "") aboutUsText += l_companyUrl + ":" + companyUrl + "<br />";
	if(companyAddress != "") aboutUsText += l_companyAddress + ":" + companyAddress + "<br />";
	if(companyEmail != "") aboutUsText += l_companyEmail + ":" + companyEmail + "<br />";
	if(companyTel != "") aboutUsText += l_companyTel + ":" + companyTel + "<br />";
	var s = "";
	s += "<div style='width:100%; height:280px;'>";
	s += "<div style='width:30%; height:160px; float:left;'>";
	if(logoUrl != "") {
		if(logoUrl != null) s += "<img src='" + logoUrl + "'/>";
	}
	s += "</div>";
	s += "<div style='width:65%; height:160px; float:left;'>" + aboutUsText + "</a></div>";
	s += "<div style='width:100%; height:110px;'>" + text + "</div>";
	s += "</div>";
	return s;
}
core.HtmlHelper.toEmailHtml = function() {
	var s = "";
	s += "<form  id='sendEmail' action='" + RunTime.book.gateway + "' method='post'>";
	s += "<table border='none' class='email'>";
	s += "<tr><td>" + L.s("To","To") + ":</td><td><input  id='tomail' type='text' name='tomail' /></td></tr>";
	s += "<tr><td>" + L.s("YourName","Your Name") + ":</td><td><input id='yname' type='text' name='yourName'/></td></tr>";
	s += "<tr><td>" + L.s("YourEmail","Your Email") + ":</td><td><input id='youremail' type='text' name='frommail'/></td></tr>";
	s += "<tr><td>" + L.s("Message","Message") + ":</td><td><textarea rows='7' cols='30' id='sharemsg' name='message'></textarea></td></tr>";
	s += "<tr><td></td><td align='right'><input style='width:100px' type='button' onclick='RunTime.onSendEmail();' value='" + L.s("Send","Send") + "'/></td></tr>";
	s += "</table>";
	s += "<input style='display:none' type='hide' id='subject' name='subject' value='" + L.s("YourFriend","YourFirend") + L.s("ShareEmailTitle","ShareEmailTitle") + "'/>";
	s += "</form>";
	return s;
}
core.HtmlHelper.toThumbsHtml = function(pages) {
	var s = "";
	var _g1 = 0, _g = pages.length;
	while(_g1 < _g) {
		var i = _g1++;
		var page = pages[i];
		s += core.HtmlHelper.toThumbsNodeHtml(page);
	}
	return s;
}
core.HtmlHelper.toThumbsNodeHtml = function(page) {
	return "<img class=\"thumb\" src=\"" + page.urlThumb + "\" onclick=\"gotoPage(" + page.num + "); \" />";
}
core.HtmlHelper.toBookmarksHtml = function(bookmarks,singleMode,lbEnable,rbEnable) {
	var s = "";
	s += "<div id=\"op\">";
	s += "<textarea id=\"bookmarknote\"></textarea>";
	if(singleMode) s += "<button onclick=\"addBookmark(0)\">Add Bookmark</button>"; else {
		if(lbEnable) s += "<button onclick=\"addBookmark(-1)\">Add Left Bookmark</button>"; else s += "<button disabled=\"disabled\">Add Left Bookmark</button>";
		if(rbEnable) s += "<button onclick=\"addBookmark(1)\">Add Right Bookmark</button>"; else s += "<button disabled=\"disabled\">Add Right Bookmark</button>";
	}
	s += "<button>Remove All</button>";
	s += "</div>";
	s += "<ul style=\"margin:20px 0px 0px 0px;padding-left:5px;padding-right:5px;\">";
	if(bookmarks != null) {
		var _g1 = 0, _g = bookmarks.length;
		while(_g1 < _g) {
			var i = _g1++;
			var bookmark = bookmarks[i];
			s += core.HtmlHelper.toBookmarkNodeHtml(bookmark);
		}
	}
	s += "</ul>";
	return s;
}
core.HtmlHelper.toBookmarkNodeHtml = function(bookmark) {
	var s = "";
	s += "<li class=\"bookmarkrow\" >";
	s += "<p class=\"p1\" onclick=\"gotoPage(" + Std.string(bookmark.pageNum - 1) + ")\" > P" + bookmark.pageNum + "</p>";
	s += "<p class=\"p2\" onclick=\"gotoPage(" + Std.string(bookmark.pageNum - 1) + ")\">" + bookmark.text + "</p>";
	s += "<button onclick=\"removeBookmark(" + Std.string(bookmark.pageNum - 1) + ")\" style=\"float:right;margin:0px -2px;\">" + L.s("RemoveBookmark","Remove") + "</button>";
	s += "</li>";
	return s;
}
core.HtmlHelper.toSearchHtml = function() {
	return StringTools.replace(RunTime.searchHtmlCache,"$Search",L.s("Search"));
}
core.HtmlHelper.toSearchResultHtml = function(results) {
	var s = "";
	s += "<table>";
	var _g1 = 0, _g = results.length;
	while(_g1 < _g) {
		var i = _g1++;
		var item = results[i];
		s += "<tr onclick=\"gotoPage(" + Std.string(item.page - 1) + ")\">";
		s += "<td width=\"40px\" class=\"colPage\">";
		s += "P" + Std.string(item.page);
		s += "</td>";
		s += "<td class=\"colContent\">";
		s += item.content;
		s += "</td>";
		s += "</tr>";
	}
	s += "</table>";
	return s;
}
core.HtmlHelper.toVideoHtml = function(video) {
	return video.toHtml();
}
core.HtmlHelper.toRectVideoHtml = function(video,xx,yy,ww,hh) {
	var loop = video.autoRepeat?"loop":"";
	var s = "";
	s += "<div id=\"" + video.id + "\" style=\"position:absolute;z-index:101;left:" + Std.string(Math.round(xx)) + "px;top:" + Std.string(Math.round(yy)) + "px;width:" + Std.string(Math.round(ww)) + "px;height:" + Std.string(Math.round(hh)) + "px;\">";
	s += "<video class=\"video-js\" src=\"" + video.url + "\" width=\"" + Std.string(Math.round(ww)) + "\" height=\"" + Std.string(Math.round(hh)) + "\" controls autoplay preload onloadeddata='RunTime.logVideoView(\"" + video.url + "\", \"" + video.youtubeId + "\")' " + loop + " >";
	s += "</video>";
	s += "</div>";
	return s;
}
core.HtmlHelper.toRectYoutubeVideoHtml = function(video,xx,yy,ww,hh) {
	var s = "";
	s += "<div id=\"" + video.id + "\" style=\"position:absolute;z-index:101;left:" + Std.string(Math.round(xx)) + "px;top:" + Std.string(Math.round(yy)) + "px;width:1px;height:1px;\">";
	s += "<iframe frameborder=\"0\" type=\"text/html\"" + "\" width=\"" + Std.string(Math.round(ww)) + "\" height=\"" + Std.string(Math.round(hh)) + "\"" + " src=\"http://www.youtube.com/embed/" + video.youtubeId + "?controls=1&amp;antoplay=1&amp;enablejsapi=1\">";
	s += "</iframe>";
	s += "</div>";
	return s;
}
core.HtmlHelper.toSlideshow = function(slideshow) {
	return slideshow.toHtml();
}
core.HtmlHelper.toSlideshowPopupHtml = function(item) {
	var w = item.getScaleWidth() + 25;
	var h = item.getScaleHeight() + 25;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	}
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / item.popupWidth) * 0.8 | 0;
		h = h * (RunTime.clientHeight / item.popupHeight) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var window_color = "#333333";
	var s = "";
	s += "<div id=\"popupSlideshow\" style=\"position:absolute; z-index:204; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px;  background-color:#7f7f7f; color:#fff; text-align:left;-moz-transform: scale(0.2);-moz-transition:width  0s ease-out; -webkit-transform: scale(0.2); -webkit-transition: 0s ease-out; \">";
	s += "<div style=\"height:" + Std.string(h - 24) + "px; overflow:hidden; line-height:120%; text-align:center; background-color:" + window_color + "; margin:6px; padding:6px;\">";
	s += item.htmlContent;
	s += "</div>";
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();RunTime.clearSlideshowContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toSlideShowHtml = function(slideshow,xx,yy,ww,hh,scale) {
	var offY = 45;
	var s = "";
	if(slideshow.showAsButton == true) {
		if(slideshow.transition == "move") {
			slideshow.htmlContent += "<div >";
			slideshow.htmlContent += "<div  style=\"width: 100%;overflow: hidden;\">";
			slideshow.htmlContent += "<div class=\"inner\" id=\"p_" + slideshow.id + "\" style=\"width:" + slideshow.slides.length * 100 + "%;\">";
			var _g1 = 0, _g = slideshow.slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				slideshow.htmlContent += "<article style=\"width:" + 1 / slideshow.slides.length * 100 + "%;\">";
				slideshow.htmlContent += "<img src=\"" + slideshow.slides[i].url + "\" onclick=\"RunTime.navigateUrl('" + slideshow.slides[i].href + "');\">";
				slideshow.htmlContent += "</article>";
			}
			slideshow.htmlContent += "</div>";
			slideshow.htmlContent += "</div>";
			slideshow.htmlContent += "</div>";
		} else if(slideshow.transition == "fade") {
			slideshow.htmlContent += "<div >";
			slideshow.htmlContent += "<div class=\"inner\" id=\"p_" + slideshow.id + "\" >";
			var _g1 = 0, _g = slideshow.slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				var sid = slideshow.id + "_" + (slideshow.slides.length - i);
				slideshow.htmlContent += "<article style=\"text-align:left;width:100%;overflow: hidden;background:" + slideshow.bgColor + ";position:absolute;\"" + " id=\"a_" + sid + "\">";
				slideshow.htmlContent += "<img id=\"" + sid + "\" src=\"" + slideshow.slides[slideshow.slides.length - i - 1].url + "\"" + " onclick=\"RunTime.navigateUrl('" + slideshow.slides[slideshow.slides.length - i - 1].href + "');\" " + " style=\"" + "\"" + " onload=\"RunTime.resizeSlide(this," + (ww | 0) + "," + (hh | 0) + ",'" + sid + "'," + scale + ");\"" + ">";
				slideshow.htmlContent += "</article>";
			}
			slideshow.htmlContent += "</div>";
			slideshow.htmlContent += "</div>";
		}
		RunTime.slideshowPopupHtml = "";
		RunTime.slideshowPopupHtml = core.HtmlHelper.toSlideshowPopupHtml(slideshow);
		s += "<div id=\"" + "slideshowButtonImg" + "\" style=\"position:absolute;z-index:99;left:" + Std.string(Math.round(xx)) + "px;top:" + Std.string(Math.round(yy)) + "px;width:" + Std.string(Math.round(ww)) + "px;height:" + Std.string(Math.round(hh)) + "px;\">";
		var sid = "buttonImg_" + slideshow.id + "_" + 1;
		s += "<img id=\"" + sid + "\" src=\"" + slideshow.slides[0].url + "\"" + " onclick=\"RunTime.showAsButtonClick();\" " + " style=\"" + "cursor:pointer;" + "\"" + " onload=\"RunTime.resizeSlide(this," + (ww | 0) + "," + (hh | 0) + ",'" + sid + "'," + scale + ");\"" + ">";
		s += "</div>";
	} else {
		var offY1 = 45;
		if(slideshow.transition == "move") {
			s += "<div class=\"" + "slides" + "\" style=\"position:absolute;z-index:108;left:" + Std.string(Math.round(xx)) + "px;top:" + Std.string(Math.round(yy) - offY1) + "px;width:" + Std.string(Math.round(ww)) + "px;height:" + Std.string(Math.round(hh)) + "px;\">";
			s += "<div  style=\"width: 100%;overflow: hidden;\">";
			s += "<div class=\"inner\" id=\"p_" + slideshow.id + "\" style=\"width:" + slideshow.slides.length * 100 + "%;\">";
			var _g1 = 0, _g = slideshow.slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				s += "<article style=\"width:" + 1 / slideshow.slides.length * 100 + "%;\">";
				s += "<img src=\"" + slideshow.slides[i].url + "\" onclick=\"RunTime.navigateUrl('" + slideshow.slides[i].href + "');\">";
				s += "</article>";
			}
			s += "</div>";
			s += "</div>";
			s += "</div>";
		} else if(slideshow.transition == "fade") {
			s += "<div class=\"" + "slides" + "\" style=\"position:absolute;z-index:108;left:" + Std.string(Math.round(xx)) + "px;top:" + Std.string(Math.round(yy) - offY1) + "px;width:" + Std.string(Math.round(ww)) + "px;height:" + Std.string(Math.round(hh)) + "px;\">";
			s += "<div class=\"inner\" id=\"p_" + slideshow.id + "\" >";
			var _g1 = 0, _g = slideshow.slides.length;
			while(_g1 < _g) {
				var i = _g1++;
				var sid = slideshow.id + "_" + (slideshow.slides.length - i);
				s += "<article style=\"text-align:left;width:100%;overflow: hidden;background:" + slideshow.bgColor + ";position:absolute;\"" + " id=\"a_" + sid + "\">";
				s += "<img id=\"" + sid + "\" src=\"" + slideshow.slides[slideshow.slides.length - i - 1].url + "\"" + " onclick=\"RunTime.navigateUrl('" + slideshow.slides[slideshow.slides.length - i - 1].href + "');\" " + " style=\"" + "\"" + " onload=\"RunTime.resizeSlide(this," + (ww | 0) + "," + (hh | 0) + ",'" + sid + "'," + scale + ");\"" + ">";
				s += "</article>";
			}
			s += "</div>";
			s += "</div>";
		}
	}
	return s;
}
core.HtmlHelper.toPopupImageHtml = function(item,success) {
	var w = RunTime.clientWidth * 0.9 | 0;
	var h = RunTime.clientHeight * 0.9 | 0;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	} else {
		var img = null;
		var onload = function() {
			item.popupWidth = img.image.width;
			item.popupHeight = img.image.height;
			core.HtmlHelper.toPopupImageHtml(item,success);
		};
		img = new core.Html5Image(item.destination,onload);
		return;
	}
	var helper = new orc.utils.ImageMetricHelper(w,h);
	var scale = helper.getMaxFitScale(RunTime.clientWidth * 0.9,RunTime.clientHeight * 0.9);
	h = h * scale | 0;
	w = w * scale | 0;
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var s = "";
	if(item.popupWidth != null && item.popupHeight != null) {
		s = "";
		s += "<div id=\"popupImage\" style=\"position:absolute; z-index:200;left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; background-color:#ffffff; -moz-transform: scale(0.2);-moz-transition: width 0s ease-out;-webkit-transform: scale(0.2); -webkit-transition: 0s ease-out; \" >";
		s += "<img src=\"" + Std.string(item.destination) + "\" style=\"width:" + Std.string(w) + "px;height:" + Std.string(h) + "px;\" />";
		s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
		s += "</div>";
	} else {
		s = "";
		s += "<div style=\"position:absolute;z-index:200; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; \">";
		s += "<div style=\"margin:0 auto; \">";
		s += "<img src=\"" + Std.string(item.destination) + "\" style=\"max-width:" + Std.string(w) + "px;max-height:" + Std.string(h) + "px;\" />";
		s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
		s += "</div>";
		s += "</div>";
	}
	if(success != null) success(s);
}
core.HtmlHelper.toPopupVideoHtml = function(item) {
	var w = 600;
	var h = 480;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	}
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / item.popupWidth) * 0.8 | 0;
		h = h * (RunTime.clientHeight / item.popupHeight) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var s = "";
	s += "<div id=\"popupVideo\"style=\"position:absolute; z-index:201;left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; background-color:#ffffff;-moz-transform: scale(0.2);-moz-transition: width 0s ease-out; -webkit-transform: scale(0.2); -webkit-transition: 0s ease-out; \">";
	if(item.youtubeId == null || item.youtubeId == "") {
		s += "<video class=\"video-js\" src=\"" + Std.string(item.destination) + "\" width=\"" + Std.string(Math.round(w)) + "\" height=\"" + Std.string(Math.round(h)) + "\" controls autoplay preload onloadstart='this.play()' >";
		s += "</video>";
	} else {
		s += "<div style=\"position:absolute;padding-left:0px;padding-top:0px;\">";
		s += "<iframe frameborder=\"0\" type=\"text/html\"" + "\" width=\"" + Std.string(Math.round(w)) + "\" height=\"" + Std.string(Math.round(h)) + "\"" + " src=\"http://www.youtube.com/embed/" + Std.string(item.youtubeId) + "?controls=1&amp;antoplay=1&amp;enablejsapi=1\">";
		s += "</iframe>";
		s += "</div>";
	}
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toPopupPageAudiosHtml = function(audio,isLeft) {
	if(isLeft == null) isLeft = true;
	var w = 200;
	var h = 40;
	var left = 20;
	var top = 20;
	var s = "";
	if(audio == null) return s;
	if(isLeft == true) {
		s += "<div style=\"position:absolute; z-index:102;left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; \">";
		s += "<audio class=\"video-js\" src=\"" + audio.url + "\" width=\"" + Std.string(Math.round(w)) + "\" height=\"" + Std.string(Math.round(h)) + "\" controls autoplay >";
		s += "</audio>";
		s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearLeftBgAudio();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
		s += "</div>";
	} else {
		s += "<div style=\"position:absolute; z-index:102;left:" + Std.string(RunTime.clientWidth / 2 + left | 0) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; \">";
		s += "<audio class=\"video-js\" src=\"" + audio.url + "\" width=\"" + Std.string(Math.round(w)) + "\" height=\"" + Std.string(Math.round(h)) + "\" controls autoplay >";
		s += "</audio>";
		s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearRightBgAudio();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
		s += "</div>";
	}
	return s;
}
core.HtmlHelper.toPopupAudioHtml = function(item) {
	var w = 200;
	var h = 40;
	var left = 20;
	var top = 20;
	var s = "";
	s += "<div style=\"position:absolute; z-index:203;left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; \">";
	s += "<audio class=\"video-js\" src=\"" + Std.string(item.destination) + "\" width=\"" + Std.string(Math.round(w)) + "\" height=\"" + Std.string(Math.round(h)) + "\" controls autoplay >";
	s += "</audio>";
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearAudio();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toPopupHtml = function(item) {
	var w = 600;
	var h = 480;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	}
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / item.popupWidth) * 0.8 | 0;
		h = h * (RunTime.clientHeight / item.popupHeight) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var window_color = "#333333";
	if(item.window_color != null) window_color = item.window_color;
	var isIframe = false;
	if(item.htmlText != null) {
		if(item.htmlText.indexOf("iframe") != -1) isIframe = true;
	}
	var s = "";
	s += "<div id=\"popupMessage\" style=\"position:absolute; z-index:204; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; background-color:#7f7f7f; color:#fff; text-align:left;-moz-transform: scale(0.2);-moz-transition:width  0s ease-out; -webkit-transform: scale(0.2); -webkit-transition: 0s ease-out; \">";
	s += "<div style=\"overflow-x:hidden; overflow-y:auto; height:" + Std.string(h - 24) + "px; line-height:120%; background-color:" + window_color + "; margin:6px; padding:0 6px 6px 6px;\">";
	if(!isIframe) s += "<pre style=\"white-space:pre-wrap; word-wrap:break-word;\">";
	s += Std.string(item.htmlText);
	if(!isIframe) s += "</pre>";
	s += "</div>";
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toBookmarkPopupHtml = function(item) {
	var w = 600;
	var h = 480;
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / w) * 0.8 | 0;
		h = h * (RunTime.clientHeight / h) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var s = "";
	s += "<div style=\"position:absolute; z-index:104; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px; background-color:#ffffff; text-align:left; \">";
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-12px;top:-12px;\" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toHighLightPopupHtml = function(item,szSaveFunName,szDeleteFunName) {
	var w = 300;
	var h = 200;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	}
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / item.popupWidth) * 0.8 | 0;
		h = h * (RunTime.clientHeight / item.popupHeight) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var colorString = item.color;
	if(colorString == "") colorString = "rgba(0,255,0,0.4)";
	colorString = HxOverrides.substr(colorString,5,null);
	var results = colorString.split(",");
	var colorR = StringTools.hex(Std.parseInt(results[0]),2);
	var colorG = StringTools.hex(Std.parseInt(results[1]),2);
	var colorB = StringTools.hex(Std.parseInt(results[2]),2);
	var newColorString = "#" + colorR + colorG + colorB;
	var s = "";
	s += "<div style=\"position:absolute; z-index:800; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px;  \">" + "<div style=\"margin:0 0; position:absolute; background-color:black;" + "-webkit-border-radius:10px; border:1px solid #ccc; opacity:0.6;width:300px; height:200px;\">" + "</div>" + "<div style=\"position:absolute;top:10px; left:10px; width:280px;" + "background-color:#ffffff; border:1px solid #ccc;margin:0 0;\">" + "<div style=\"width:280px; height:128px; background:#ffffff; padding-top:22px; \">" + "<div id=\"colorPicker\" style=\"position:absolute; top:0px; left:0px;\"><input type=\"button\" value=\"\" id=\"showColor\" style=\"width:150px; background:" + newColorString + "; border:1px solid #ccc; height:20px;\" onclick=\"showHighlightColor()\" /><input type=\"hidden\" id=\"showVal\" value=\"\"><div id=\"color\" style=\"display:none; position:absolute;top:0px;left:0px; background:#ffffff; z-index:810; \"></div></div>" + "<textarea id=\"textNote\" style=\"width:275px; height:123px; border:0px\">" + Std.string(item.note.text) + "</textarea>" + "</div>" + "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-20px;top:-20px;\" />" + "</div>" + "<div style=\"position:absolute;top:182px; left:10px;width:280px; margin:0 0; \">" + "<img onclick=\"" + szSaveFunName + "()\" src=\"content/images/save.png\" style=\"position:absolute;" + "left:5px; top:-16px;  \"/>" + "<img onclick=\"" + szDeleteFunName + "()\" src=\"content/images/garbage.png\" style=\"position:absolute;" + "left:75px; top:-16px;  \"/>" + "</div>" + "</div>";
	return s;
}
core.HtmlHelper.toNotePopupHtml = function(item,szSaveFunName,szDeleteFunName) {
	var w = 300;
	var h = 200;
	if(item.popupWidth != null && item.popupHeight != null) {
		w = item.popupWidth;
		h = item.popupHeight;
	}
	if(RunTime.clientWidth < 480) {
		w = w * (RunTime.clientWidth / item.popupWidth) * 0.8 | 0;
		h = h * (RunTime.clientHeight / item.popupHeight) * 0.8 | 0;
	}
	var left = (RunTime.clientWidth - w) / 2 | 0;
	var top = (RunTime.clientHeight - h) / 2 | 0;
	var s = "";
	s += "<div style=\"position:absolute; z-index:800; left:" + Std.string(left) + "px; top:" + Std.string(top) + "px; width:" + Std.string(w) + "px; height:" + Std.string(h) + "px;  \">" + "<div style=\"margin:0 0; position:absolute; background-color:black;" + "-webkit-border-radius:10px; border:1px solid #ccc; opacity:0.6;width:300px; height:200px;\">" + "</div>" + "<div style=\"position:absolute;top:10px; left:10px; width:280px;" + "background-color:#ffffff; border:1px solid #ccc;margin:0 0;\">" + "<div style=\"width:280px; height:150px; background:#ffffff\">" + "<textarea id=\"textNote\" style=\"width:275px; height:145px; border:0px\">" + Std.string(item.note.text) + "</textarea>" + "</div>" + "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-20px;top:-20px;\" />" + "</div>" + "<div style=\"position:absolute;top:182px; left:10px;width:280px; margin:0 0; \">" + "<img onclick=\"" + szSaveFunName + "()\" src=\"content/images/save.png\" style=\"position:absolute;" + "left:5px; top:-16px\"/>" + "<img onclick=\"" + szDeleteFunName + "()\" src=\"content/images/garbage.png\" style=\"position:absolute;" + "left:75px; top:-16px\"/>" + "</div>" + "</div>";
	return s;
}
core.HtmlHelper.toInputPwdHtml = function() {
	var left = (RunTime.clientWidth - 300) / 2;
	var top = (RunTime.clientHeight - 180) / 2;
	var pos = "position:absolute;z-index:200; left:" + Std.string(Math.round(left)) + "px; top:" + Std.string(Math.round(top)) + "px;";
	var s = "";
	s += "<div id=\"inputBox\" style=\" " + pos + " width:300px; height:120px;background-color:#CCCCCC; \">";
	s += "<p>" + L.s("NeedPassword") + "</p>";
	s += "<input id=\"tbKeyword\" type=\"password\" style=\"width:120px; height:20px; \"  onkeypress=\"return onInputKeyPress(event)\" />";
	s += "<input type=\"button\" style=\"height:20px; \" value=\"" + L.s("Submit") + "\" onclick=\"inputPwd(); \" />";
	s += "</div>";
	return s;
}
core.HtmlHelper.toInputUnlockPwdHtml = function() {
	var left = (RunTime.clientWidth - 300) / 2;
	var top = (RunTime.clientHeight - 180) / 2;
	var pos = "position:absolute;z-index:200;left:" + Std.string(Math.round(left)) + "px; top:" + Std.string(Math.round(top)) + "px;";
	var s = "";
	s += "<div id=\"inputBox\" style=\" " + pos + " width:300px; height:120px;background-color:#CCCCCC; \">";
	s += "<img width=\"24\" height=\"24\" src=\"content/images/close.png\" onclick=\"clearPopupContents();\" style=\"position:absolute;right:-10px;top:-10px;\" />";
	s += "<p>" + L.s("NeedPassword") + "</p>";
	s += "<input id=\"tbKeyword\" type=\"password\" style=\"width:120px; height:20px; \"  onkeypress=\"return onUnlockKeyPress(event)\" />";
	s += "<input type=\"button\" style=\"height:20px; \" value=\"" + L.s("Submit") + "\" onclick=\"unlockPage(); \" />";
	s += "</div>";
	return s;
}
core.LangCfg = function() {
	this.content = null;
	this.isDefault = false;
};
core.LangCfg.__name__ = true;
core.LangCfg.prototype = {
	__class__: core.LangCfg
}
core.Note = function() {
	this.image = new Image();
	this.image.src = "content/images/iconNote.png";
	this.text = "";
	this.x = 0;
	this.y = 0;
	this.guid = "";
};
core.Note.__name__ = true;
core.Note.prototype = {
	hitTest: function(x,y) {
		if(this.image == null) return false;
		if(x < this.x || y < this.y || x > this.x + this.image.width || y > this.y + this.image.height) return false;
		return true;
	}
	,loadToContext2D: function(context) {
		if(this.image != null) context.drawImage(this.image,this.x,this.y);
	}
	,draw: function() {
		if(this.canvas == null || this.image == null) return;
		var context = this.getContext();
		context.drawImage(this.image,this.x,this.y);
	}
	,getContext: function() {
		return this.canvas.getContext("2d");
	}
	,setCanvas: function(canvas) {
		this.canvas = canvas;
	}
	,setImage: function(image) {
		this.image = image;
	}
	,__class__: core.Note
}
core.NoteIcon = function() {
	this.note = new core.Note();
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.pageNum = -1;
	this.guid = "";
	this.checked = false;
	this.pageLayoutType = 0;
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
};
core.NoteIcon.__name__ = true;
core.NoteIcon.prototype = {
	click: function(popupXOffset,popupYOffset) {
		if(popupYOffset == null) popupYOffset = 0;
		if(popupXOffset == null) popupXOffset = 0;
		RunTime.showPopupMaskLayer();
		RunTime.setOffset(js.Lib.document.getElementById("cvsOthers"),popupXOffset,popupYOffset);
		js.Lib.document.getElementById("cvsOthers").innerHTML = core.HtmlHelper.toNotePopupHtml(this,"saveNote","deleteNote");
		js.Lib.document.getElementById("textNote").focus();
	}
	,moveSave: function() {
		if(this.twidth == 0 || this.theight == 0) return;
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,TransformData: function(vx,vy) {
		var dp = this.getDrawParams();
		if(RunTime.book.rightToLeft) {
			if(vx > RunTime.clientWidth / 2) dp = this.getLeftDrawParams(); else dp = this.getRightDrawParams();
		} else if(vx > RunTime.clientWidth / 2) dp = this.getRightDrawParams(); else dp = this.getLeftDrawParams();
		this.x = dp.sx + (vx - dp.dx) / (dp.dw / dp.sw) - this.width / 2;
		this.y = dp.sy + (vy - dp.dy) / (dp.dh / dp.sh) - this.height / 2;
	}
	,moveClick: function(cx,cy) {
		if(cy == null) cy = 0;
		if(cx == null) cx = 0;
		this.TransformData(cx,cy);
		RunTime.clearPopupContents();
		RunTime.flipBook.bookContext.render();
	}
	,hitTest: function(mouseX,mouseY) {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		var result = mouseX >= xx && mouseY >= yy && mouseX <= xx + ww && mouseY <= yy + hh;
		return result;
	}
	,draw: function(context) {
		var radius = 5;
		context.save();
		context.fillStyle = "rgba(255,0,0,0.4)";
		context.fillRect(this.tx | 0,this.ty | 0,this.twidth | 0,this.theight | 0);
		context.restore();
		if(this.note != null) {
			this.note.x = this.tx;
			this.note.y = this.ty - this.note.image.height;
			this.note.draw();
		}
	}
	,loadToContext2D: function(context) {
		var radius = 5;
		context.save();
		context.fillStyle = "rgba(255,0,0,0.4)";
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		context.drawImage(this.note.image,xx | 0,yy | 0,ww | 0,hh | 0);
		context.restore();
		if(this.note != null) {
			this.note.x = this.x;
			this.note.y = this.y - this.note.image.height;
			this.note.draw();
		}
	}
	,remove: function() {
		localStorage.removeItem(this.guid);
	}
	,updateText: function(text) {
		this.note.text = text;
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,setChecked: function(bChecked) {
		this.checked = bChecked;
		if(this.checked) {
		} else {
		}
	}
	,fillData: function(guid,json) {
		var objJSON = JSON.parse(json);
		this.x = Std.parseFloat(objJSON.obj[0].x);
		this.y = Std.parseFloat(objJSON.obj[0].y);
		this.width = Std.parseFloat(objJSON.obj[0].width);
		this.height = Std.parseFloat(objJSON.obj[0].height);
		this.note.text = objJSON.obj[0].note;
		this.pageNum = Std.parseInt(objJSON.obj[0].page);
		this.guid = guid;
	}
	,DataTransform: function() {
		var dp = this.getDrawParams();
		this.pageNum = this.tpageNum;
		if(RunTime.singlePage) {
		} else if(RunTime.book.rightToLeft) {
			if(this.tx > RunTime.clientWidth / 2) dp = this.getLeftDrawParams(); else dp = this.getRightDrawParams();
		} else if(this.tx > RunTime.clientWidth / 2) dp = this.getRightDrawParams(); else dp = this.getLeftDrawParams();
		this.x = dp.sx + (this.tx - dp.dx) / (dp.dw / dp.sw);
		this.y = dp.sy + (this.ty - dp.dy) / (dp.dh / dp.sh);
		this.width = this.twidth / (dp.dw / dp.sw);
		this.height = this.theight / (dp.dh / dp.sh);
		haxe.Log.trace("x=" + this.x + ",y=" + this.y + ",width=" + this.width + ",height=" + this.height,{ fileName : "NoteIcon.hx", lineNumber : 198, className : "core.NoteIcon", methodName : "DataTransform"});
	}
	,save: function() {
		if(this.twidth == 0 || this.theight == 0) return;
		this.guid = RunTime.kvPrex + "@$ni$@" + new Date().getTime();
		this.DataTransform();
		localStorage.setItem(this.guid,this.toJSONString());
	}
	,toJSONString: function() {
		var json = "{\"obj\":[{\"x\":\"" + this.x + "\",\"y\":\"" + this.y + "\",\"width\":\"" + this.width + "\",\"height\":\"" + this.height + "\",\"page\":\"" + this.pageNum + "\",\"note\":\"" + this.note.text + "\"}]}";
		return json;
	}
	,getBottom: function() {
		return this.y + this.height;
	}
	,getTop: function() {
		return this.y;
	}
	,getRight: function() {
		return this.x + this.width;
	}
	,getLeft: function() {
		return this.x;
	}
	,getContext: function() {
		return this.canvas.getContext("2d");
	}
	,setCanvas: function(canvas) {
		this.canvas = canvas;
		if(this.note != null) this.note.setCanvas(this.canvas);
	}
	,clone: function() {
		this.DataTransform();
		var hl = new core.NoteIcon();
		hl.x = this.x;
		hl.y = this.y;
		hl.width = this.width;
		hl.height = this.height;
		hl.pageNum = this.pageNum;
		hl.guid = this.guid;
		hl.note.text = this.note.text;
		return hl;
	}
	,getRightDrawParams: function() {
		var dp = RunTime.getDrawParams(1);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,getLeftDrawParams: function() {
		var dp = RunTime.getDrawParams(-1);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		return dp;
	}
	,__class__: core.NoteIcon
}
core.Page = function() {
	this.locked = false;
	this.canZoom = true;
	this.aniScale = 1;
	this.visible = true;
	this.pageOffset = 0;
	this.scale = 1;
	this.offsetX = 0;
	this.offsetY = 0;
	this.bigMode = false;
	this.locked = false;
};
core.Page.__name__ = true;
core.Page.prototype = {
	clipImage: function(ctx,img,sx,sy,sw,sh,dx,dy,dw,dh) {
		if(img.src == null || img.src == "") {
			js.Lib.alert("no data");
			return;
		}
		var pw = RunTime.book.pageWidth;
		var ph = RunTime.book.pageHeight;
		var rw = img.width;
		var rh = img.height;
		var scaleX = rw / pw;
		var scaleY = rh / ph;
		sx = sx * scaleX;
		sy = sy * scaleY;
		sw = sw * scaleX;
		sh = sh * scaleY;
		if(sx < 0) sx = 0;
		if(sy < 0) sy = 0;
		if(sx + sw > img.width) sw = img.width - sx;
		if(sy + sh > img.height) sh = img.height - sy;
		if(sx >= img.width || sy >= img.height) return;
		if(sw < 1 || sh < 1) return;
		ctx.save();
		ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
		if(RunTime.bLocked && this.locked) {
			ctx.fillStyle = "rgb(255,255,255)";
			ctx.fillRect(dx | 0,dy | 0,dw | 0,dh | 0);
		}
		ctx.restore();
	}
	,drawImageCore: function(offset) {
		var dp = this.drawParams.clone();
		if(dp == null || dp.dw < 2) return;
		dp.applyTransform(this.scale,this.offsetX,this.offsetY);
		if(offset == 0) {
			this.clipImage(this.ctx,this._imagePage,dp.sx,dp.sy,dp.sw,dp.sh,dp.dx,dp.dy,dp.dw,dp.dh);
			if(this._imageData == null) {
			}
		} else if(offset > 0) this.clipImage(this.ctx,this._imagePage,dp.sx,dp.sy,dp.sw * (1 - offset),dp.sh,dp.dx + dp.dw * offset,dp.dy,dp.dw * (1 - offset),dp.dh); else {
			offset = -offset;
			this.clipImage(this.ctx,this._imagePage,dp.sx + offset * dp.sw,dp.sy,dp.sw * (1 - offset),dp.sh,dp.dx,dp.dy,dp.dw * (1 - offset),dp.dh);
		}
	}
	,draw: function() {
		if(this.ctx == null) return;
		if(this.drawParams == null) return;
		if(this.visible == false) return;
		var offset = this.pageOffset;
		if(this.bookContext != null) offset += this.bookContext.pageOffset;
		if(offset > -1.001 && offset < -1) offset = -1;
		if(offset > 1 && offset < 1.001) offset = 1;
		if(offset <= -1 || offset >= 1) return;
		this.drawImageCore(offset);
	}
	,loadToContext2D: function(ctx) {
		this.ctx = ctx;
		if(this._imagePage == null) this.getImagePage();
		if(this.loaded == true) {
			RunTime.divLoading.style.display = "none";
			this.draw();
		}
	}
	,onMouseClick: function(e) {
		if(e.localX > this._imagePage.width * 0.5) {
			if(this.turnRightCallback != null) this.turnRightCallback();
		} else if(this.turnLeftCallback != null) this.turnLeftCallback();
	}
	,clearCallback: function() {
		this.turnLeftCallback = null;
		this.turnRightCallback = null;
	}
	,zoom: function(scale) {
		this.aniScale += scale;
	}
	,loadBigImagePage: function() {
		var img = new Image();
		img.src = this.getBigPageUrl();
	}
	,getPageUrl: function() {
		return this.urlPage;
	}
	,getBlankPage: function() {
		return "content/images/bgLock.png";
	}
	,getBigPageUrl: function() {
		var url = this.urlPage;
		var seg = url.split("/");
		if(js.Lib.window.navigator.userAgent.indexOf("iPhone") != -1) return "content/medium/" + seg[seg.length - 1]; else return "content/pages/" + seg[seg.length - 1];
	}
	,setBigImageMode: function() {
		this.bigMode = true;
	}
	,getImagePage: function() {
		if(this._imagePage != null) return this._imagePage;
		var img = new Image();
		img.src = this.urlPage;
		img.onload = $bind(this,this.onLoadImage);
		RunTime.divLoading.style.display = "inline";
		this._imagePage = img;
		return this._imagePage;
	}
	,onLoadImage: function() {
		RunTime.divLoading.style.display = "none";
		this.loaded = true;
		this.draw();
		if(RunTime.flipBook.currentPageNum == null || RunTime.flipBook.currentPageNum == this.num) {
			RunTime.flipBook.loadCtxHotlinks();
			RunTime.flipBook.bookContext.render();
		}
	}
	,__class__: core.Page
}
core.PagePair = function(i) {
	if(i < 0 || i >= RunTime.book.pages.length) return;
	this.currentPageNum = i;
	if(i == 0) {
		this.rightPage = RunTime.book.pages[i];
		this.rightPage.isDoublePageMode = true;
		this.rightPage.pageOffset = 0;
		this.rightPage.drawParams = RunTime.getDrawParams(1);
		RunTime.flipBook.zoomRightPage.width = this.rightPage.drawParams.dw | 0;
		RunTime.flipBook.zoomRightPage.height = this.rightPage.drawParams.dh | 0;
		RunTime.flipBook.zoomRightPage.style.left = Std.string(this.rightPage.drawParams.dx) + "px";
		RunTime.flipBook.zoomRightPage.style.top = Std.string(this.rightPage.drawParams.dy) + "px";
		RunTime.flipBook.rightPageLock.style.width = (this.rightPage.drawParams.dw | 0) + "px";
		RunTime.flipBook.rightPageLock.style.height = (this.rightPage.drawParams.dh | 0) + "px";
		RunTime.flipBook.rightPageLock.style.left = Std.string(this.rightPage.drawParams.dx) + "px";
		RunTime.flipBook.rightPageLock.style.top = Std.string(this.rightPage.drawParams.dy) + "px";
		RunTime.flipBook.rightLockIcon.style.left = ((this.rightPage.drawParams.dw - 128) / 2 | 0) + "px";
		RunTime.flipBook.rightLockIcon.style.top = ((this.rightPage.drawParams.dh - 128) / 2 | 0) + "px";
	} else if(i == RunTime.book.pages.length - 1 && i % 2 == 1) {
		this.leftPage = RunTime.book.pages[i];
		this.leftPage.isDoublePageMode = true;
		this.leftPage.pageOffset = 0;
		this.leftPage.drawParams = RunTime.getDrawParams(-1);
		RunTime.flipBook.zoomLeftPage.width = this.leftPage.drawParams.dw | 0;
		RunTime.flipBook.zoomLeftPage.height = this.leftPage.drawParams.dh | 0;
		RunTime.flipBook.zoomLeftPage.style.left = Std.string(this.leftPage.drawParams.dx) + "px";
		RunTime.flipBook.zoomLeftPage.style.top = Std.string(this.leftPage.drawParams.dy) + "px";
		RunTime.flipBook.leftPageLock.style.width = (this.leftPage.drawParams.dw | 0) + "px";
		RunTime.flipBook.leftPageLock.style.height = (this.leftPage.drawParams.dh | 0) + "px";
		RunTime.flipBook.leftPageLock.style.left = Std.string(this.leftPage.drawParams.dx) + "px";
		RunTime.flipBook.leftPageLock.style.top = Std.string(this.leftPage.drawParams.dy) + "px";
		RunTime.flipBook.leftLockIcon.style.left = ((this.leftPage.drawParams.dw - 128) / 2 | 0) + "px";
		RunTime.flipBook.leftLockIcon.style.top = ((this.leftPage.drawParams.dh - 128) / 2 | 0) + "px";
	} else {
		var right = i + 1 - (i + 1) % 2;
		var left = right - 1;
		this.leftPage = RunTime.book.pages[left];
		this.rightPage = RunTime.book.pages[right];
		this.leftPage.isDoublePageMode = true;
		this.rightPage.isDoublePageMode = true;
		this.leftPage.pageOffset = 0;
		this.rightPage.pageOffset = 0;
		this.leftPage.drawParams = RunTime.getDrawParams(-1);
		this.rightPage.drawParams = RunTime.getDrawParams(1);
		RunTime.flipBook.zoomRightPage.width = this.rightPage.drawParams.dw | 0;
		RunTime.flipBook.zoomRightPage.height = this.rightPage.drawParams.dh | 0;
		RunTime.flipBook.zoomRightPage.style.left = Std.string(this.rightPage.drawParams.dx) + "px";
		RunTime.flipBook.zoomRightPage.style.top = Std.string(this.rightPage.drawParams.dy) + "px";
		RunTime.flipBook.zoomLeftPage.width = this.leftPage.drawParams.dw | 0;
		RunTime.flipBook.zoomLeftPage.height = this.leftPage.drawParams.dh | 0;
		RunTime.flipBook.zoomLeftPage.style.left = Std.string(this.leftPage.drawParams.dx) + "px";
		RunTime.flipBook.zoomLeftPage.style.top = Std.string(this.leftPage.drawParams.dy) + "px";
		RunTime.flipBook.rightPageLock.style.width = (this.rightPage.drawParams.dw | 0) + "px";
		RunTime.flipBook.rightPageLock.style.height = (this.rightPage.drawParams.dh | 0) + "px";
		RunTime.flipBook.rightPageLock.style.left = Std.string(this.rightPage.drawParams.dx) + "px";
		RunTime.flipBook.rightPageLock.style.top = Std.string(this.rightPage.drawParams.dy) + "px";
		RunTime.flipBook.rightLockIcon.style.left = ((this.rightPage.drawParams.dw - 128) / 2 | 0) + "px";
		RunTime.flipBook.rightLockIcon.style.top = ((this.rightPage.drawParams.dh - 128) / 2 | 0) + "px";
		RunTime.flipBook.leftPageLock.style.width = (this.leftPage.drawParams.dw | 0) + "px";
		RunTime.flipBook.leftPageLock.style.height = (this.leftPage.drawParams.dh | 0) + "px";
		RunTime.flipBook.leftPageLock.style.left = Std.string(this.leftPage.drawParams.dx) + "px";
		RunTime.flipBook.leftPageLock.style.top = Std.string(this.leftPage.drawParams.dy) + "px";
		RunTime.flipBook.leftLockIcon.style.left = ((this.leftPage.drawParams.dw - 128) / 2 | 0) + "px";
		RunTime.flipBook.leftLockIcon.style.top = ((this.leftPage.drawParams.dh - 128) / 2 | 0) + "px";
	}
};
core.PagePair.__name__ = true;
core.PagePair.prototype = {
	getNumInDoubleMode: function() {
		if(this.leftPage != null) return this.leftPage.numInDoubleMode; else if(this.rightPage != null) return this.rightPage.numInDoubleMode; else return -1;
	}
	,match: function(pageNum) {
		if(this.leftPage != null) {
			if(this.leftPage.num == pageNum) return -1;
		}
		if(this.rightPage != null) {
			if(this.rightPage.num == pageNum) return 1;
		}
		return 0;
	}
	,__class__: core.PagePair
}
core.SearchResult = function(content,page) {
	this.content = content;
	this.page = page;
};
core.SearchResult.__name__ = true;
core.SearchResult.prototype = {
	__class__: core.SearchResult
}
core.Slide = function() {
};
core.Slide.__name__ = true;
core.Slide.prototype = {
	__class__: core.Slide
}
core.SlideshowInfo = function() {
	this.bgColor = "";
	this.htmlContent = "";
	this.slides = new Array();
	this.tweener = new core.Tweener();
	this.idx = 1;
	this.transition = "fade";
	this.countOfClip = 0;
};
core.SlideshowInfo.__name__ = true;
core.SlideshowInfo.prototype = {
	updateLayout: function(dom) {
		if(dom == null) return;
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		dom.style.left = Std.string(Math.round(xx)) + "px";
		dom.style.top = Std.string(Math.round(yy)) + "px";
		var videoDom = dom.firstChild;
		videoDom.width = Std.string(Math.round(ww));
		videoDom.height = Std.string(Math.round(hh));
	}
	,toHtml: function() {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		if(Std.string(this.pagewidth) != "NaN") {
			if(this.pagewidth != dp.sw) {
				ww = dp.sw * (dp.dw / dp.sw);
				hh = dp.sh * (dp.dh / dp.sh);
			}
		}
		return core.HtmlHelper.toSlideShowHtml(this,xx,yy,ww,hh,dp.dw / dp.sw);
	}
	,getScaleHeight: function() {
		var dp = this.getDrawParams();
		var hh = this.height * (dp.dh / dp.sh);
		if(Std.string(this.pagewidth) != "NaN") {
			if(this.pagewidth != dp.sw) hh = dp.sh * (dp.dh / dp.sh);
		}
		if(hh >= RunTime.clientHeight) hh = RunTime.clientHeight - 60;
		return hh;
	}
	,getScaleWidth: function() {
		var dp = this.getDrawParams();
		var ww = this.width * (dp.dw / dp.sw);
		if(Std.string(this.pagewidth) != "NaN") {
			if(this.pagewidth != dp.sw) ww = dp.sw * (dp.dw / dp.sw);
		}
		if(ww >= RunTime.clientWidth) ww = RunTime.clientWidth - 60;
		return ww;
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		var ctx = RunTime.flipBook.bookContext;
		dp.applyTransform(ctx.scale,ctx.offsetX,ctx.offsetY);
		return dp;
	}
	,onSlideChange: function(count) {
		if(count % this.countOfClip != 0) return;
		if(this.transition == "move") {
			var p = js.Lib.document.getElementById("p_" + this.id);
			if(p != null) {
				var pidx = -this.idx * 100;
				p.style.marginLeft = Std.string(pidx) + "%";
			}
			this.idx++;
			if(this.idx >= this.slides.length) this.idx = 0;
		} else {
			var a = js.Lib.document.getElementById("a_" + this.id + "_" + Std.string(this.idx));
			this.idx++;
			if(this.idx == this.slides.length + 1) {
				var _g1 = 0, _g = this.slides.length;
				while(_g1 < _g) {
					var i = _g1++;
					var t = i + 1;
					var p = js.Lib.document.getElementById("a_" + this.id + "_" + Std.string(t));
					if(p != null) p.style.cssText = "text-align:left;width:100%;overflow: hidden;opacity:1;position:absolute;background:" + this.bgColor;
				}
			}
			if(a != null && this.idx < this.slides.length + 1) a.style.cssText = "text-align:left;opacity: 0 ; -webkit-transition: 0.5s ease-out;width:100%;overflow: hidden;";
			if(this.idx > this.slides.length) this.idx = 1;
		}
	}
	,stopTweener: function() {
		this.tweener.stop();
	}
	,startTweener: function() {
		this.countOfClip = 50 * Std.parseInt(this.interval);
		this.tweener.onChange = $bind(this,this.onSlideChange);
		this.tweener.start(1000000);
	}
	,__class__: core.SlideshowInfo
}
core.Tweener = function() {
	this.count = 0;
	this.maxCount = 0;
};
core.Tweener.__name__ = true;
core.Tweener.prototype = {
	onChangeInvoke: function() {
		this.count++;
		if(this.onChange == null) return;
		if(this.count > this.maxCount) return;
		this.onChange(this.count);
		this.run();
	}
	,run: function() {
		if(this.count >= this.maxCount) return;
		haxe.Timer.delay($bind(this,this.onChangeInvoke),33);
	}
	,stop: function() {
		this.maxCount = this.count;
	}
	,start: function(max) {
		if(max == null) max = 1;
		this.maxCount = max;
		this.count = 0;
		this.run();
	}
	,__class__: core.Tweener
}
core.VideoInfo = function() {
	this.pageLayoutType = 0;
	this.youtubeId = "";
	this.url = "";
	this.id = "";
};
core.VideoInfo.__name__ = true;
core.VideoInfo.prototype = {
	updateLayout: function(dom) {
		if(dom == null) return;
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		dom.style.left = Std.string(Math.round(xx)) + "px";
		dom.style.top = Std.string(Math.round(yy)) + "px";
		var videoDom = dom.firstChild;
		videoDom.width = Std.string(Math.round(ww));
		videoDom.height = Std.string(Math.round(hh));
	}
	,toHtml: function() {
		var dp = this.getDrawParams();
		var xx = dp.dx + (this.x - dp.sx) * (dp.dw / dp.sw);
		var yy = dp.dy + (this.y - dp.sy) * (dp.dh / dp.sh);
		var ww = this.width * (dp.dw / dp.sw);
		var hh = this.height * (dp.dh / dp.sh);
		if(this.youtubeId != null && this.youtubeId != "") return core.HtmlHelper.toRectYoutubeVideoHtml(this,xx,yy,ww,hh); else return core.HtmlHelper.toRectVideoHtml(this,xx,yy,ww,hh);
	}
	,getDrawParams: function() {
		var dp = RunTime.getDrawParams(this.pageLayoutType);
		var ctx = RunTime.flipBook.bookContext;
		dp.applyTransform(ctx.scale,ctx.offsetX,ctx.offsetY);
		return dp;
	}
	,__class__: core.VideoInfo
}
core.ZoomStatus = { __ename__ : true, __constructs__ : ["normal","zooming","zoomed","zoomin","zoomout"] }
core.ZoomStatus.normal = ["normal",0];
core.ZoomStatus.normal.toString = $estr;
core.ZoomStatus.normal.__enum__ = core.ZoomStatus;
core.ZoomStatus.zooming = ["zooming",1];
core.ZoomStatus.zooming.toString = $estr;
core.ZoomStatus.zooming.__enum__ = core.ZoomStatus;
core.ZoomStatus.zoomed = ["zoomed",2];
core.ZoomStatus.zoomed.toString = $estr;
core.ZoomStatus.zoomed.__enum__ = core.ZoomStatus;
core.ZoomStatus.zoomin = ["zoomin",3];
core.ZoomStatus.zoomin.toString = $estr;
core.ZoomStatus.zoomin.__enum__ = core.ZoomStatus;
core.ZoomStatus.zoomout = ["zoomout",4];
core.ZoomStatus.zoomout.toString = $estr;
core.ZoomStatus.zoomout.__enum__ = core.ZoomStatus;
haxe.BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw "BaseCode : base length must be a power of two.";
	this.base = base;
	this.nbits = nbits;
};
haxe.BaseCode.__name__ = true;
haxe.BaseCode.encode = function(s,base) {
	var b = new haxe.BaseCode(haxe.io.Bytes.ofString(base));
	return b.encodeString(s);
}
haxe.BaseCode.decode = function(s,base) {
	var b = new haxe.BaseCode(haxe.io.Bytes.ofString(base));
	return b.decodeString(s);
}
haxe.BaseCode.prototype = {
	decodeString: function(s) {
		return this.decodeBytes(haxe.io.Bytes.ofString(s)).toString();
	}
	,encodeString: function(s) {
		return this.encodeBytes(haxe.io.Bytes.ofString(s)).toString();
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe.io.Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.b[pin++]];
				if(i == -1) throw "BaseCode : invalid encoded char";
				buf |= i;
			}
			curbits -= 8;
			out.b[pout++] = buf >> curbits & 255 & 255;
		}
		return out;
	}
	,initTable: function() {
		var tbl = new Array();
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0, _g = this.base.length;
		while(_g1 < _g) {
			var i = _g1++;
			tbl[this.base.b[i]] = i;
		}
		this.tbl = tbl;
	}
	,encodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		var size = b.length * 8 / nbits | 0;
		var out = haxe.io.Bytes.alloc(size + (b.length * 8 % nbits == 0?0:1));
		var buf = 0;
		var curbits = 0;
		var mask = (1 << nbits) - 1;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < nbits) {
				curbits += 8;
				buf <<= 8;
				buf |= b.b[pin++];
			}
			curbits -= nbits;
			out.b[pout++] = base.b[buf >> curbits & mask] & 255;
		}
		if(curbits > 0) out.b[pout++] = base.b[buf << nbits - curbits & mask] & 255;
		return out;
	}
	,__class__: haxe.BaseCode
}
haxe.Http = function(url) {
	this.url = url;
	this.headers = new Hash();
	this.params = new Hash();
	this.async = true;
};
haxe.Http.__name__ = true;
haxe.Http.requestUrl = function(url) {
	var h = new haxe.Http(url);
	h.async = false;
	var r = null;
	h.onData = function(d) {
		r = d;
	};
	h.onError = function(e) {
		throw e;
	};
	h.request(false);
	return r;
}
haxe.Http.prototype = {
	onStatus: function(status) {
	}
	,onError: function(msg) {
	}
	,onData: function(data) {
	}
	,request: function(post) {
		var me = this;
		var r = new js.XMLHttpRequest();
		var onreadystatechange = function() {
			if(r.readyState != 4) return;
			var s = (function($this) {
				var $r;
				try {
					$r = r.status;
				} catch( e ) {
					$r = null;
				}
				return $r;
			}(this));
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) me.onData(r.responseText); else switch(s) {
			case null: case undefined:
				me.onError("Failed to connect or resolve host");
				break;
			case 12029:
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.onError("Unknown host");
				break;
			default:
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.keys();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += StringTools.urlEncode(p) + "=" + StringTools.urlEncode(this.params.get(p));
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e ) {
			this.onError(e.toString());
			return;
		}
		if(this.headers.get("Content-Type") == null && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.keys();
		while( $it1.hasNext() ) {
			var h = $it1.next();
			r.setRequestHeader(h,this.headers.get(h));
		}
		r.send(uri);
		if(!this.async) onreadystatechange();
	}
	,setPostData: function(data) {
		this.postData = data;
	}
	,setParameter: function(param,value) {
		this.params.set(param,value);
	}
	,setHeader: function(header,value) {
		this.headers.set(header,value);
	}
	,__class__: haxe.Http
}
haxe.Log = function() { }
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = true;
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
}
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = s.charCodeAt(i);
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype = {
	getData: function() {
		return this.b;
	}
	,toHex: function() {
		var s = new StringBuf();
		var chars = [];
		var str = "0123456789abcdef";
		var _g1 = 0, _g = str.length;
		while(_g1 < _g) {
			var i = _g1++;
			chars.push(HxOverrides.cca(str,i));
		}
		var _g1 = 0, _g = this.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = this.b[i];
			s.b += String.fromCharCode(chars[c >> 4]);
			s.b += String.fromCharCode(chars[c & 15]);
		}
		return s.b;
	}
	,toString: function() {
		return this.readString(0,this.length);
	}
	,readString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c2 = b[i++];
				var c3 = b[i++];
				s += fcc((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
			}
		}
		return s;
	}
	,compare: function(other) {
		var b1 = this.b;
		var b2 = other.b;
		var len = this.length < other.length?this.length:other.length;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			if(b1[i] != b2[i]) return b1[i] - b2[i];
		}
		return this.length - other.length;
	}
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
	}
	,blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		if(b1 == b2 && pos > srcpos) {
			var i = len;
			while(i > 0) {
				i--;
				b1[i + pos] = b2[i + srcpos];
			}
			return;
		}
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b1[i + pos] = b2[i + srcpos];
		}
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,get: function(pos) {
		return this.b[pos];
	}
	,__class__: haxe.io.Bytes
}
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
if(!haxe.web) haxe.web = {}
haxe.web.Request = function() { }
haxe.web.Request.__name__ = true;
haxe.web.Request.getParams = function() {
	var get = window.location.search.substr(1);
	var params = new Hash();
	var _g = 0, _g1 = new EReg("[&;]","g").split(get);
	while(_g < _g1.length) {
		var p = _g1[_g];
		++_g;
		var pl = p.split("=");
		if(pl.length < 2) continue;
		var name = pl.shift();
		params.set(StringTools.urlDecode(name),StringTools.urlDecode(pl.join("=")));
	}
	return params;
}
haxe.web.Request.getHostName = function() {
	return window.location.host;
}
haxe.web.Request.getURI = function() {
	return window.location.pathname;
}
if(!haxe.xml) haxe.xml = {}
if(!haxe.xml._Fast) haxe.xml._Fast = {}
haxe.xml._Fast.NodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeAccess.__name__ = true;
haxe.xml._Fast.NodeAccess.prototype = {
	resolve: function(name) {
		var x = this.__x.elementsNamed(name).next();
		if(x == null) {
			var xname = this.__x.nodeType == Xml.Document?"Document":this.__x.getNodeName();
			throw xname + " is missing element " + name;
		}
		return new haxe.xml.Fast(x);
	}
	,__class__: haxe.xml._Fast.NodeAccess
}
haxe.xml._Fast.AttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.AttribAccess.__name__ = true;
haxe.xml._Fast.AttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		var v = this.__x.get(name);
		if(v == null) throw this.__x.getNodeName() + " is missing attribute " + name;
		return v;
	}
	,__class__: haxe.xml._Fast.AttribAccess
}
haxe.xml._Fast.HasAttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasAttribAccess.__name__ = true;
haxe.xml._Fast.HasAttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		return this.__x.exists(name);
	}
	,__class__: haxe.xml._Fast.HasAttribAccess
}
haxe.xml._Fast.HasNodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasNodeAccess.__name__ = true;
haxe.xml._Fast.HasNodeAccess.prototype = {
	resolve: function(name) {
		return this.__x.elementsNamed(name).hasNext();
	}
	,__class__: haxe.xml._Fast.HasNodeAccess
}
haxe.xml._Fast.NodeListAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeListAccess.__name__ = true;
haxe.xml._Fast.NodeListAccess.prototype = {
	resolve: function(name) {
		var l = new List();
		var $it0 = this.__x.elementsNamed(name);
		while( $it0.hasNext() ) {
			var x = $it0.next();
			l.add(new haxe.xml.Fast(x));
		}
		return l;
	}
	,__class__: haxe.xml._Fast.NodeListAccess
}
haxe.xml.Fast = function(x) {
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + Std.string(x.nodeType);
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
};
haxe.xml.Fast.__name__ = true;
haxe.xml.Fast.prototype = {
	getElements: function() {
		var it = this.x.elements();
		return { hasNext : $bind(it,it.hasNext), next : function() {
			var x = it.next();
			if(x == null) return null;
			return new haxe.xml.Fast(x);
		}};
	}
	,getInnerHTML: function() {
		var s = new StringBuf();
		var $it0 = this.x.iterator();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			s.b += Std.string(x.toString());
		}
		return s.b;
	}
	,getInnerData: function() {
		var it = this.x.iterator();
		if(!it.hasNext()) throw this.getName() + " does not have data";
		var v = it.next();
		var n = it.next();
		if(n != null) {
			if(v.nodeType == Xml.PCData && n.nodeType == Xml.CData && StringTools.trim(v.getNodeValue()) == "") {
				var n2 = it.next();
				if(n2 == null || n2.nodeType == Xml.PCData && StringTools.trim(n2.getNodeValue()) == "" && it.next() == null) return n.getNodeValue();
			}
			throw this.getName() + " does not only have data";
		}
		if(v.nodeType != Xml.PCData && v.nodeType != Xml.CData) throw this.getName() + " does not have data";
		return v.getNodeValue();
	}
	,getName: function() {
		return this.x.nodeType == Xml.Document?"Document":this.x.getNodeName();
	}
	,__class__: haxe.xml.Fast
}
haxe.xml.Parser = function() { }
haxe.xml.Parser.__name__ = true;
haxe.xml.Parser.parse = function(str) {
	var doc = Xml.createDocument();
	haxe.xml.Parser.doParse(str,0,doc);
	return doc;
}
haxe.xml.Parser.doParse = function(str,p,parent) {
	if(p == null) p = 0;
	var xml = null;
	var state = 1;
	var next = 1;
	var aname = null;
	var start = 0;
	var nsubs = 0;
	var nbrackets = 0;
	var c = str.charCodeAt(p);
	while(!(c != c)) {
		switch(state) {
		case 0:
			switch(c) {
			case 10:case 13:case 9:case 32:
				break;
			default:
				state = next;
				continue;
			}
			break;
		case 1:
			switch(c) {
			case 60:
				state = 0;
				next = 2;
				break;
			default:
				start = p;
				state = 13;
				continue;
			}
			break;
		case 13:
			if(c == 60) {
				var child = Xml.createPCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child);
				nsubs++;
				state = 0;
				next = 2;
			}
			break;
		case 17:
			if(c == 93 && str.charCodeAt(p + 1) == 93 && str.charCodeAt(p + 2) == 62) {
				var child = Xml.createCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child);
				nsubs++;
				p += 2;
				state = 1;
			}
			break;
		case 2:
			switch(c) {
			case 33:
				if(str.charCodeAt(p + 1) == 91) {
					p += 2;
					if(HxOverrides.substr(str,p,6).toUpperCase() != "CDATA[") throw "Expected <![CDATA[";
					p += 5;
					state = 17;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) == 68 || str.charCodeAt(p + 1) == 100) {
					if(HxOverrides.substr(str,p + 2,6).toUpperCase() != "OCTYPE") throw "Expected <!DOCTYPE";
					p += 8;
					state = 16;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) != 45 || str.charCodeAt(p + 2) != 45) throw "Expected <!--"; else {
					p += 2;
					state = 15;
					start = p + 1;
				}
				break;
			case 63:
				state = 14;
				start = p;
				break;
			case 47:
				if(parent == null) throw "Expected node name";
				start = p + 1;
				state = 0;
				next = 10;
				break;
			default:
				state = 3;
				start = p;
				continue;
			}
			break;
		case 3:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(p == start) throw "Expected node name";
				xml = Xml.createElement(HxOverrides.substr(str,start,p - start));
				parent.addChild(xml);
				state = 0;
				next = 4;
				continue;
			}
			break;
		case 4:
			switch(c) {
			case 47:
				state = 11;
				nsubs++;
				break;
			case 62:
				state = 9;
				nsubs++;
				break;
			default:
				state = 5;
				start = p;
				continue;
			}
			break;
		case 5:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				var tmp;
				if(start == p) throw "Expected attribute name";
				tmp = HxOverrides.substr(str,start,p - start);
				aname = tmp;
				if(xml.exists(aname)) throw "Duplicate attribute";
				state = 0;
				next = 6;
				continue;
			}
			break;
		case 6:
			switch(c) {
			case 61:
				state = 0;
				next = 7;
				break;
			default:
				throw "Expected =";
			}
			break;
		case 7:
			switch(c) {
			case 34:case 39:
				state = 8;
				start = p;
				break;
			default:
				throw "Expected \"";
			}
			break;
		case 8:
			if(c == str.charCodeAt(start)) {
				var val = HxOverrides.substr(str,start + 1,p - start - 1);
				xml.set(aname,val);
				state = 0;
				next = 4;
			}
			break;
		case 9:
			p = haxe.xml.Parser.doParse(str,p,xml);
			start = p;
			state = 1;
			break;
		case 11:
			switch(c) {
			case 62:
				state = 1;
				break;
			default:
				throw "Expected >";
			}
			break;
		case 12:
			switch(c) {
			case 62:
				if(nsubs == 0) parent.addChild(Xml.createPCData(""));
				return p;
			default:
				throw "Expected >";
			}
			break;
		case 10:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(start == p) throw "Expected node name";
				var v = HxOverrides.substr(str,start,p - start);
				if(v != parent.getNodeName()) throw "Expected </" + parent.getNodeName() + ">";
				state = 0;
				next = 12;
				continue;
			}
			break;
		case 15:
			if(c == 45 && str.charCodeAt(p + 1) == 45 && str.charCodeAt(p + 2) == 62) {
				parent.addChild(Xml.createComment(HxOverrides.substr(str,start,p - start)));
				p += 2;
				state = 1;
			}
			break;
		case 16:
			if(c == 91) nbrackets++; else if(c == 93) nbrackets--; else if(c == 62 && nbrackets == 0) {
				parent.addChild(Xml.createDocType(HxOverrides.substr(str,start,p - start)));
				state = 1;
			}
			break;
		case 14:
			if(c == 63 && str.charCodeAt(p + 1) == 62) {
				p++;
				var str1 = HxOverrides.substr(str,start + 1,p - start - 2);
				parent.addChild(Xml.createProlog(str1));
				state = 1;
			}
			break;
		}
		c = str.charCodeAt(++p);
	}
	if(state == 1) {
		start = p;
		state = 13;
	}
	if(state == 13) {
		if(p != start || nsubs == 0) parent.addChild(Xml.createPCData(HxOverrides.substr(str,start,p - start)));
		return p;
	}
	throw "Unexpected end";
}
haxe.xml.Parser.isValidChar = function(c) {
	return c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45;
}
var js = js || {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.isClass = function(o) {
	return o.__name__;
}
js.Boot.isEnum = function(e) {
	return e.__ename__;
}
js.Boot.getClass = function(o) {
	return o.__class__;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
js.Lib = function() { }
js.Lib.__name__ = true;
js.Lib.debug = function() {
	debugger;
}
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
var orc = orc || {}
if(!orc.utils) orc.utils = {}
orc.utils.DrawHelper = function() { }
orc.utils.DrawHelper.__name__ = true;
orc.utils.DrawHelper.createFillStyle = function(cssStyleColor,alpha) {
	cssStyleColor = StringTools.replace(cssStyleColor,"0x","");
	cssStyleColor = StringTools.replace(cssStyleColor,"0X","");
	cssStyleColor = StringTools.replace(cssStyleColor,"#","");
	if(cssStyleColor.length == 6) {
		var r = Std.string(Std.parseInt("0x" + HxOverrides.substr(cssStyleColor,0,2)));
		var g = Std.string(Std.parseInt("0x" + HxOverrides.substr(cssStyleColor,2,2)));
		var b = Std.string(Std.parseInt("0x" + HxOverrides.substr(cssStyleColor,4,2)));
		return "rgba(" + r + "," + g + "," + b + "," + Std.string(alpha) + ")";
	}
	return "";
}
orc.utils.ImageMetricHelper = function(imgWidth,imgHeight) {
	this.width = imgWidth;
	this.height = imgHeight;
	this.diagonalLineTheta = Math.atan2(this.width,this.height);
	this.diagonalLineLength = Math.sqrt(this.width * this.width + this.height * this.height);
};
orc.utils.ImageMetricHelper.__name__ = true;
orc.utils.ImageMetricHelper.prototype = {
	getMaxFitScale: function(width,height,rotation) {
		if(rotation == null) rotation = 0;
		var scaleX;
		var scaleY;
		if(rotation == 0 || rotation == 180) {
			scaleX = width / this.width;
			scaleY = height / this.height;
		} else {
			var r = Math.PI * rotation / 180;
			var t0 = this.diagonalLineTheta + r;
			var w0 = Math.abs(this.diagonalLineLength * Math.sin(t0));
			var h0 = Math.abs(this.diagonalLineLength * Math.cos(t0));
			var t1 = -this.diagonalLineTheta + r;
			var w1 = Math.abs(this.diagonalLineLength * Math.sin(t1));
			var h1 = Math.abs(this.diagonalLineLength * Math.cos(t1));
			var w = Math.max(w0,w1);
			var h = Math.max(h0,h1);
			scaleX = width / w;
			scaleY = height / h;
		}
		return Math.min(scaleX,scaleY);
	}
	,__class__: orc.utils.ImageMetricHelper
}
orc.utils.UrlParam = function() {
};
orc.utils.UrlParam.__name__ = true;
orc.utils.UrlParam.prototype = {
	__class__: orc.utils.UrlParam
}
orc.utils.Util = function() { }
orc.utils.Util.__name__ = true;
orc.utils.Util.request = function(url,call,onError) {
	var http = new haxe.Http(url);
	http.onData = call;
	http.onError = function(e) {
		if(onError != null) onError();
	};
	http.request(false);
}
orc.utils.Util.getUrlParam = function(key) {
	var params = orc.utils.Util.getUrlParams();
	var _g = 0;
	while(_g < params.length) {
		var param = params[_g];
		++_g;
		var p = param;
		if(p.key == key) return p.value;
	}
	return "";
}
orc.utils.Util.getUrlParams = function() {
	var url = js.Lib.window.location.href;
	var results = new Array();
	var index = url.indexOf("?");
	if(index > 0) {
		var params = HxOverrides.substr(url,index + 1,null);
		var lines = params.split("&");
		var _g = 0;
		while(_g < lines.length) {
			var line = lines[_g];
			++_g;
			var terms = line.split("=");
			if(terms.length == 2) {
				var val = new orc.utils.UrlParam();
				val.key = terms[0];
				val.value = terms[1];
				results.push(val);
			}
		}
	}
	return results;
}
orc.utils.Util.getXmlChilds = function(xml) {
	var i = xml.elements();
	var list = new Array();
	while(i.hasNext() == true) {
		var node = i.next();
		list.push(node);
	}
	return list;
}
orc.utils.Util.searchPos = function(txt,keyword) {
	var list = [];
	var index = -1;
	while(true) {
		var from = 0;
		if(index != -1) {
			from = index + keyword.length;
			if(from < 0) from = 0;
		}
		index = txt.indexOf(keyword,from);
		if(index > -1 && index + keyword.length <= txt.length) list.push(index); else break;
	}
	return list;
}
orc.utils.Util.createSearchResults = function(txt,keyword,posList,page) {
	var results = [];
	var maxChars = 50;
	var coloredWord = "<font color='#FF0000'>" + keyword + "</font>";
	var _g1 = 0, _g = posList.length;
	while(_g1 < _g) {
		var i = _g1++;
		var index = posList[i];
		var r = new core.SearchResult("",page);
		var offset = index;
		if(txt.length < maxChars) r.content = txt; else {
			var from = index - Math.max(0,maxChars - keyword.length) / 2 | 0;
			if(from < 0) from = 0;
			r.content = HxOverrides.substr(txt,from,maxChars);
			offset = index - from;
			if(from + maxChars < txt.length) r.content += " ...";
			if(from > 0) {
				r.content = "... " + r.content;
				offset += 4;
			}
		}
		r.content = HxOverrides.substr(r.content,0,offset) + "<font color='#FF0000'>" + HxOverrides.substr(r.content,offset,keyword.length) + "</font>" + HxOverrides.substr(r.content,offset + keyword.length,null);
		results.push(r);
	}
	return results;
}
var $_;
function $bind(o,m) { var f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var Void = { __ename__ : ["Void"]};
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.Prolog = "prolog";
Xml.Document = "document";
if(typeof document != "undefined") js.Lib.document = document;
if(typeof window != "undefined") {
	js.Lib.window = window;
	js.Lib.window.onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if(f == null) return false;
		return f(msg,[url + ":" + line]);
	};
}
js.XMLHttpRequest = window.XMLHttpRequest?XMLHttpRequest:window.ActiveXObject?function() {
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch( e ) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch( e1 ) {
			throw "Unable to create XMLHttpRequest object.";
		}
	}
}:(function($this) {
	var $r;
	throw "Unable to create XMLHttpRequest object.";
	return $r;
}(this));
L.instance = new Hash();
RunTime.useGoogleUaAsLogViewer = true;
RunTime.urlIndex = "html5forpc.html";
RunTime.urlZoom = "zoom.html";
RunTime.urlRoot = "";
RunTime.urlBookinfo = RunTime.urlRoot + "data/bookinfo.xml";
RunTime.urlPageInfo = RunTime.urlRoot + "data/pages.xml";
RunTime.urlHotlinks = RunTime.urlRoot + "data/hotlinks.xml";
RunTime.urlContents = RunTime.urlRoot + "data/contents.xml";
RunTime.urlSearch = RunTime.urlRoot + "data/search.xml";
RunTime.urlVideos = RunTime.urlRoot + "data/videos.xml";
RunTime.urlButtons = RunTime.urlRoot + "data/buttons.xml";
RunTime.urlAudios = RunTime.urlRoot + "data/sounds.xml";
RunTime.urlBookmarks = RunTime.urlRoot + "data/bookmarks.xml";
RunTime.urlLang = RunTime.urlRoot + "data/languages/languages.xml";
RunTime.urlSlideshow = RunTime.urlRoot + "data/slideshow.xml";
RunTime.urlShareInfo = RunTime.urlRoot + "data/share.xml";
RunTime.urlAbout = RunTime.urlRoot + "data/copyright.xml";
RunTime.searchHtmlCache = "";
RunTime.inputHtmlCache = "";
RunTime.isFullscreen = false;
RunTime.resizeTimer = new haxe.Timer(600);
RunTime.languages = new Array();
RunTime.book = new core.Book();
RunTime.singlePage = false;
RunTime.bookTop = 0;
RunTime.bookBottom = 0;
RunTime.bookLeft = 0;
RunTime.bookRight = 0;
RunTime.pcode = "";
RunTime.bottomBarAlpha = 0.6;
RunTime.bottomBarHeight = 40;
RunTime.autoflipButtonUnselectedAlpha = 0.5;
RunTime.doubleClickIntervalMs = 300;
RunTime.doubleZoomIntervalMs = 1000;
RunTime.highLights = new Array();
RunTime.notes = new Array();
RunTime.bLocked = true;
RunTime.kvPrex = "";
RunTime.key = "";
RunTime.slideshowPopupHtml = "";
Zoom.imgSrc = "";
Zoom.pageNum = "";
Zoom.bookId = "";
Zoom.analyticsUA = "";
Zoom.bookTitle = "";
Zoom.bbv = "";
Zoom.pcode = "";
Zoom.hotlinks = [];
Zoom.videos = [];
Zoom.buttons = [];
Zoom.xOffset = 0;
Zoom.yOffset = 0;
Zoom.popupXOffset = 0;
Zoom.popupYOffset = 0;
core.HtmlHelper.lv = 0;
Main.main();
