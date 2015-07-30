EventBoxButtons = [];

EventBox = function(param){
	Control.call(this,param);
	if (param.event) {
		var event = this.event = param.event,
			box = this.box = this.createElement("div",null,"box small",true),
			shadow = this.shadow = this.createElement("div",null,"box small shadow",true),
			line = this.line = this.createElement("div",null,"line",true);

		this._setupDisplay();
		//this._setupEditor();

		this._lastState = null;
		this.setState(EventBox.STATE_COLLAPSED, true);
		this.top(0,true);
		this.on("mousewheel",function(event){
			window.ui.onScroll(event, this.left()+0.5);
			event.stopPropagation();
		}.bind(this));

		this.addClass("small");

		this.mousedown(this.startDrag.bind(this));
		$(window).mouseup(this.stopDrag.bind(this));
		this._parent.mousemove(this.drag.bind(this));
	}
};

Item.inherit(EventBox, Control);
EventBox.className = "EventBox";

EventBox.STATE_COLLAPSED = 0;
EventBox.STATE_EXPANDED = 1;
EventBox.STATE_OPENED = 2;
//EventBox.STATE_EDITING = 3;


EventBox.prototype._setupDisplay = function(){
	if (!this.display) {
		var display = this.display = this.createElement("div",null,"display",this.box),
			title = this.title = this.createElement("h1",null,null,display),
			time = this.time = this.createElement("span",null,null,display),
			text = this.text = this.createElement("p",null,null,display),
			event = this.event;
		title.text(event.title);
		time.text(event.time.readable());
		text.text(event.text);
		time.hide();

		title.click(function(){
			if (this._state === EventBox.STATE_COLLAPSED) {
				this.setState(EventBox.STATE_EXPANDED);
			} else {
				this.setState(EventBox.STATE_COLLAPSED);
			}
		}.bind(this));

		text.click(function(){
			if (this._state === EventBox.STATE_EXPANDED || this._state === EventBox.STATE_COLLAPSED) {
				this.setState(EventBox.STATE_OPENED);
			} else {
				this.setState(EventBox.STATE_EXPANDED);
			}
		}.bind(this));

		var buttons = [];
		for (var i=0; i<EventBoxButtons.length; i++) {
			var buttonDef = EventBoxButtons[i];
			if (buttonDef.prerequisite && Util.string.templateInsert(buttonDef.prerequisite, {event:event}, true)===false) {
				continue;
			}
			var button = this.createElement(buttonDef.link ? "a" : "span",null,buttonDef.className+" EventBoxButton",display);
			if (buttonDef.link) {
				button.attr("href",Util.string.templateInsert(buttonDef.link, {event:event}));
				button.attr("target","_blank");
			}
			if (buttonDef.callback) {
				button.click(buttonDef.callback.bind(this, event, this));
			}
			buttons.push(button);
		}
		for (var i=0; i<buttons.length; i++) {
			buttons[i].css({right: 24*(buttons.length-i-1)});
		}
	}
};
/*
EventBox.prototype._setupEditor = function(){
	if (!this.editor) {
		var editor = this.editor = this.createElement("div",null,"editor",this.box),
			editTitle = this.editTitle = this.createElement("input",null,"h1",editor),
			editYear = this.editYear = this.createElement("input",null,"time",editor),
			editMonth = this.editMonth = this.createElement("select",null,"time",editor),
			editDate = this.editDate = this.createElement("select",null,"time",editor),
			//editWikiButton = this.editWikiButton = this.createElement("button",null,"wiki", editor),
			editText = this.editText = this.createElement("textarea",null,"p",editor),
			editOk = this.editOk = this.createElement("button",null,"ok",editor),
			editCancel = this.editCancel = this.createElement("button",null,"cancel",editor),
			editDelete = this.editDelete = this.createElement("button",null,"delete",editor),
			event = this.event;

		editMonth.append("<option value='null'>"+"Unknown"+"</option>");
		for (var i=0; i<Time.MONTH_NAMES.length; i++) {
			editMonth.append("<option value='"+i+"'>"+Time.MONTH_NAMES[i]+"</option>");
		}
		editDate.append("<option value='null'>"+"Unknown"+"</option>");
		for (var i=1; i<=31; i++) {
			editDate.append("<option value='"+i+"'>"+i+"</option>");
		}

		var updateAvailDates = function() {
			var year = editYear.val(),
				month = editMonth.val(),
				maxDate;
			if (month === "null") {
				maxDate = 0;
			} else {
				var monthArray = Time.isLeapYear(year) ? Time.MONTH_LENGTHS_LEAP : Time.MONTH_LENGTHS;
				maxDate = monthArray[month];
			}
			for (var i=1; i<=31; i++) {
				if (i > maxDate) {
					editDate.find("option[value="+i+"]").attr("disabled","disabled");
				} else {
					editDate.find("option[value="+i+"]").removeAttr("disabled");
				}
			}
		}

		editYear.on("change",updateAvailDates);
		editMonth.on("change",updateAvailDates);

		editor.hide();
		editTitle.val(event.title);
		editYear.val(event.time.year);
		editMonth.val(event.time.getMonth());
		editDate.val(event.time.getDate());
		editText.val(event.text);
		editTitle.attr("placeholder", "Event name");
		editYear.attr("placeholder", "Year");
		editYear.attr("pattern", "-?[0-9]+");
		editText.attr("placeholder", "Event details");
		editOk.text("Save");
		editCancel.text("Cancel");
		editDelete.text("Delete");
		//editWikiButton.text("Fetch from wikipedia");
	}
};
*/

EventBox.prototype.left = function(x){
	if (!this._halfWidth) {
		this._halfWidth = this.outerWidth() / 2;
	}
	if (x===undefined) {
		return Control.prototype.left.call(this) + this._halfWidth;
	} else {
		Control.prototype.left.call(this, x - this._halfWidth);
	}
};

EventBox.prototype.getBounds = function(){
	var left = Control.prototype.left.call(this),
		right = left + this.outerWidth(),
		top = this.top();
	return {left: left, right: right, top: top};
};


EventBox.prototype.top = function(y,immediately){
	if (y === undefined) {
		return this._animDest || Control.prototype.top.apply(this,arguments);
	} else {
		y = 32 * Math.round(y / 32);
		var timelinePos = this._parent.getLineDest(),
			lineDest;
		if (timelinePos > y && timelinePos < (y + this.height())) {
			this.line.hide();
		} else {
			var boxCenter = Math.round(y + this.height()/2);
			lineDest = {top: Math.min(timelinePos, boxCenter+1) - y, height: Math.abs(timelinePos-boxCenter)};
		}

		if (y != this._animDest) {
			this._animDest = y;
			if (immediately) {
				this.stop().css({top:y});
				if (lineDest) {
					this.line.show().stop().css(lineDest);
				}
			} else {
				this.stop().animate({top:y},100);
				if (lineDest) {
					this.line.show().stop().animate(lineDest,100);
				}
			}
		}
	}
};

EventBox.prototype.setState = function(state, immediately) {
	if (state !== this._state && !this._hasDragged) {

		var showText = (state === EventBox.STATE_EXPANDED || state === EventBox.STATE_OPENED),
			//showEdit = (state === EventBox.STATE_EDITING),
			wasLarge = (this._state === EventBox.STATE_OPENED/* || this._state === EventBox.STATE_EDITING*/),
			makeLarge = (state === EventBox.STATE_OPENED/* || state === EventBox.STATE_EDITING*/),
			changeLightbox = wasLarge != makeLarge,
			animations = [],
			afterAnimation = [],
			dest = {};
		if (state === EventBox.STATE_EXPANDED) {
			dest.height = 200;
		} else if (state === EventBox.STATE_COLLAPSED) {
			dest.height = 27;
		}

		if (makeLarge) {
			if (this._state === EventBox.STATE_EXPANDED || this._state === EventBox.STATE_COLLAPSED) {
				this._smallOffset = this._jel.offset();
			}
			dest.width = window.innerWidth-400;
			dest.height = window.innerHeight-200;
			dest.left = 200;
			dest.top = 100;
			if (this._state === EventBox.STATE_OPENED/* || this._state === EventBox.STATE_EDITING*/) {
				immediately = true;
			}
			this.removeClass("small");
		} else {
			dest.width = 200;
			if (this._smallOffset) {
				dest.left = this._smallOffset.left;
				dest.top = this._smallOffset.top;
			}
			this._smallOffset = null;
			this.addClass("small");
		}


		if (state === EventBox.STATE_COLLAPSED || state === EventBox.STATE_EXPANDED) {
			// Move line
			var top = dest.top!==undefined ? dest.top : this.top(),
				lineEnd = top,
				timelinePos = this._parent.getLineDest();
			if (lineEnd < timelinePos) {
				lineEnd += dest.height;
			}
			var lineDest = {
				top: Math.round(Math.min(timelinePos, lineEnd) - top),
				height: Math.round(Math.max(timelinePos, lineEnd) - Math.min(timelinePos, lineEnd))
			};
			this.line.show();
			if (state === EventBox.STATE_COLLAPSED) {
				this.line.css(lineDest);
			} else {
				afterAnimation.push(this.line.css.bind(this.line, lineDest));
			}
		} else {
			this.line.hide();
		}

		this.opClass(state == EventBox.STATE_OPENED, "opened");
		this.opClass(state == EventBox.STATE_EXPANDED, "expanded");
		this.opClass(state == EventBox.STATE_COLLAPSED, "collapsed");

		this.shadow.toggle(!makeLarge);
		if (showText) {
			this.text.show();
		} else {
			afterAnimation.push(this.text.hide.bind(this.text));
		}
		/*if (showEdit) {
			afterAnimation.push(this.display.hide.bind(this.display));
			afterAnimation.push(this.editor.show.bind(this.editor));
		} else {*/
			this.display.show();
		//	this.editor.hide();
		//}
				
		if (changeLightbox) {
			var lightbox = $("#lightboxBackground");
			if (makeLarge) {
				lightbox.on("click", function(){
					this.stateSmall();
					if (this._onCancelCallback instanceof Function) {
						this._onCancelCallback();
					}
				}.bind(this));
				//afterAnimation.push(Util.selection.enable.bind(Util.selection, this._jel));
				lightbox.css({opacity: 0}).show();
				animations.push({el:lightbox, dest:{opacity: 0.8}});
			} else {
				lightbox.off("click");
				//afterAnimation.push(Util.selection.disable.bind(Util.selection, this._jel));
				afterAnimation.push(lightbox.hide.bind(lightbox));
				animations.push({el:lightbox, dest:{opacity: 0}});
			}
			this.animate(dest);
		} else {
			this.css(dest);
		}
		if (!makeLarge) {
			animations.push({el:this.shadow, dest:{width:dest.width-2, height:dest.height-2}});
		}
		animations.push({el:this.box, dest:{width:dest.width-2, height:dest.height-2}});
		
		if (immediately) {
			for (var i=0; i<animations.length; i++) {
				var animation = animations[i];
				animation.el.css(animation.dest);
			}
			for (var i=0; i<afterAnimation.length; i++) {
				afterAnimation[i]();
			}
		} else {
			for (var i=0; i<animations.length; i++) {
				var animation = animations[i];
				animation.el.animate(animation.dest, 400);
			}
			setTimeout(function(afterAnimation){
				for (var i=0; i<afterAnimation.length; i++) {
					afterAnimation[i]();
				}
			}.bind(this, afterAnimation), 400);
		}

		this._lastState = this._state;
		if (state === EventBox.STATE_EXPANDED || state === EventBox.STATE_COLLAPSED) {
			this._lastSmallState = state;
		}
		this._state = state;
	}
};


EventBox.prototype.stateBack = function(immediately){
	if (this._lastState!==null) {
		this.setState(this._lastState);
		this._lastState = null;
	}
};

EventBox.prototype.stateSmall = function(immediately){
	if (this._state !== EventBox.STATE_EXPANDED && this._state !== EventBox.STATE_COLLAPSED) {
		this.setState(this._lastSmallState);
	}
};

//----- EDITING
/*
EventBox.prototype.startEdit = function(onSaveCallback, onCancelCallback, onDeleteCallback) {
	this.setState(EventBox.STATE_EDITING);
	this.editOk.off("click");
	this.editOk.on("click",this.saveEvent.bind(this));
	this.editCancel.off("click");
	this.editCancel.on("click",this.cancelEdit.bind(this));
	this.editDelete.off("click");
	this.editDelete.on("click",this.deleteEvent.bind(this));
	this._onSaveCallback = onSaveCallback;
	this._onCancelCallback = onCancelCallback;
	this._onDeleteCallback = onDeleteCallback;
};

EventBox.prototype.saveEvent = function() {
	var event = this.event;
	event.title = this.editTitle.val();
	this.title.text(event.title);
	event.text = this.editText.val();
	this.text.text(event.text);
	if (event.title || event.text) {
		event.save(this._onSaveCallback);
	}
	this.stopEdit();
};

EventBox.prototype.deleteEvent = function() {
	var event = this.event;
	event.remove(this._onDeleteCallback);
	this.stopEdit();
};

EventBox.prototype.cancelEdit = function() {
	if (this._onCancelCallback instanceof Function) {
		this._onCancelCallback();
	}
	this.stopEdit();
}

EventBox.prototype.stopEdit = function() {
	this._onSaveCallback = this._onCancelCallback = this._onDeleteCallback = null;
	this.stateBack();
};
*/
//----- DRAGGING

EventBox.prototype.startDrag = function(ev){
	this._dragging = true;
	this._dragInfo = {startX: ev.clientX, startY: ev.clientY, startTop: this.top()};
};
EventBox.prototype.drag = function(ev){
	if (this._dragging) {
		var distX = ev.clientX - this._dragInfo.startX,
			distY = ev.clientY - this._dragInfo.startY;
		if (Math.abs(distX) > 10 || Math.abs(distY) > 10) {
			this._hasDragged = true;
			var newTop = distY + this._dragInfo.startTop;
			if (newTop < 0) {
				newTop = 0;
			} else {
				var max = this._parent.height() - this.height();
				if (newTop > max) {
					newTop = max;
				}
			}
			this.top(newTop);
		}
	}
};
EventBox.prototype.stopDrag = function(ev){
	this._dragging = false;
	this._dragInfo = null;
	setTimeout(function(){
		this._hasDragged = false;
	}.bind(this), 5);
};



//----- BUTTONS

EventBoxButtons.push({
	id: "wikipedia",
	prerequisite: "${event.wikipedia}",
	className: "wikipedia",
	link: "https://en.wikipedia.org/wiki/${event.wikipedia}",
});
/*
EventBoxButtons.push({
	id: "edit",
	className: "edit",
	callback: function(event, eventBox){
		eventBox.startEdit(null, null, this._parent.removeEvent.bind(this._parent, event));
	}
});*/
