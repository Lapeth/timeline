UI = function(param) {
	Control.call(this,param);
	
	this._topContainer = this.createElement("div", null, "Container", true);
	this._bottomContainer = this.createElement("div", null, "Container", true);
	this._lineContainer = this.createElement("div", null, "Container", true);
	//this._centerline = this.createElement("div", "centerline", null, true);
	
	this._topContainer.css({position:"absolute"});
	this._bottomContainer.css({position:"absolute"});
	this._lineContainer.css({position:"absolute",height:64});
	this._jel.mousewheel(this._onScroll.bind(this));
	this.mousedown(this.onMouseDown.bind(this));
	$(window).mouseup(this.onMouseUp.bind(this));
	this.mousemove(this.onMouseMove.bind(this));
	Util.selection.disable(this._jel);
	this._timelines = [];
	this.centerDetail = 0;

	this.setResolution(3200);
	this.center = Time.now();
	this._eventBoxes = {};
	this._midpoint = this._jel.width() / 2;

	var lightboxBackground = this._lightboxBackground = this.createElement("div", "lightboxBackground", null, true);
	lightboxBackground.on("mousewheel mousedown mousemove mouseup",UI.killEvent);

	/*var addHover = this.addHover = new AddHover({parent:this});
	addHover.hide();*/

	this._editing = true;

	this._filterDialog = new FilterDialog({parent:this});
};

Item.inherit(UI, Control);
UI.className = "UI";

UI.killEvent = function(event){
	event.stopPropagation();
};

UI.prototype.addTimeline = function(){
	//var timeline = new Timeline({parent:this._lineContainer});
	var timeline = new Timeline({parent:this});
	timeline.set(this.resolution, this.center);
	this.addChild(timeline);
	this._timelines.push(timeline);
	this.render();
};

UI.prototype.render = function(){
	var timeLinesHeight = 0;
	for (var i=0; i<this._timelines.length; i++) {
		timeLinesHeight += this._timelines[i].height();
	}
	var containerHeight = (this.height() - timeLinesHeight) / 2;
	
	this._topContainer.height(containerHeight);
	this._bottomContainer.height(containerHeight);

	this._lineContainer.offset({top:containerHeight});
	this._bottomContainer.offset({top:containerHeight + timeLinesHeight});

	var timeLinesHeight = 0;
	for (var i=0; i<this._timelines.length; i++) {
		this._timelines[i].top(timeLinesHeight);
		timeLinesHeight += this._timelines[i].height();
	}
};

UI.prototype.getContainer = function(child){
	if (child instanceof Timeline) {
		return this._lineContainer;
	}
	return this.super.getContainer.call(this, child);
};

UI.prototype._onScroll = function(ev) {
	return this.onScroll(ev, ev.clientX);
}

UI.prototype.onScroll = function(ev, x){
	var zoomout = ev.deltaY == -1;
	x = (x === undefined) ? ev.clientX : x;
	if ((this.resolution >= 2 && !zoomout) || (this.resolution <= 107374182400 && zoomout)) {
		var newCenterPos = zoomout ? (2 * this._midpoint - x) : ((this._midpoint + x) * 0.5);
		this.center = this._getPositionTime(newCenterPos);
		this.setResolution(this.resolution * (zoomout ? 2 : 0.5));
	}
};

UI.prototype.setResolution = function(resolution){
	this.resolution = resolution;
	this._timeToPx = 100 / this.resolution;
	var dragOffset = 0;
	for (var i=0; i<this._timelines.length; i++) {
		var timeline = this._timelines[i];
		timeline.set(this.resolution, this.center);
		timeline.left(0);
		//timeline.left(this.centerDetail * this._timeToPx + timeline._dragStart);
		dragOffset = timeline._dragStart;
	}
	var boxes = this.getVisibleEventBoxes();
	for (var id in boxes) {
		var eventBox = boxes[id];
		eventBox.left(this._getTimePosition(eventBox.event.time) + this.centerDetail * this._timeToPx + dragOffset);
	}
};


UI.prototype.onMouseDown = function(ev){
	this._dragInfo = {x:ev.clientX, y:ev.clientY, sx:ev.clientX, sy:ev.clientY};
	for (var i=0; i<this._timelines.length; i++) {
		var timeline = this._timelines[i];
		timeline._dragStart = timeline.left();
	}
	var boxes = this.getVisibleEventBoxes();
	for (var id in boxes) {
		var eventBox = boxes[id];
		eventBox._dragStart = eventBox.left();
	}
};

UI.prototype.onMouseUp = function(ev){
	if (this._dragInfo) {
		var dx = ev.clientX - this._dragInfo.sx;
		if (dx) {
			var dt = -(dx * this.resolution / 100);
			var rdt = Math.round(dt);
			var detailOffset = (rdt-dt) * this._timeToPx;
			this.center.addDays(rdt);
			this.centerDetail = (rdt-dt);
			for (var i=0; i<this._timelines.length; i++) {
				var timeline = this._timelines[i];
				timeline.reset();
				timeline.setCenter(this.center);
				timeline.left(detailOffset + timeline._dragStart);
			}
		}
	}
	this._dragInfo = null;
};
UI.prototype.onMouseMove = function(ev){
	if (this._dragInfo) {
		var dx = ev.clientX - this._dragInfo.x;
		if (dx) {
			for (var i=0; i<this._timelines.length; i++) {
				var time = new Date().getTime();
				var timeline = this._timelines[i];
				timeline.left(timeline._dragStart + dx);
			}
			var boxes = this.getVisibleEventBoxes();
			for (var id in boxes) {
				var eventBox = boxes[id];
				eventBox.left(eventBox._dragStart + dx);
			}
		}
		//this._dragInfo.x = ev.clientX;
	}

	if (this._editing && !this._editOpened) {
		var hoveredTimeline, dist=30, tlY, tlDist, mouseY = ev.clientY;
		for (var i=0; i<this._timelines.length; i++) {
			var timeline = this._timelines[i];
			tlY = timeline.getLineOffset();
			tlDist = Math.abs(tlY - mouseY);
			if (tlDist < dist) {
				hoveredTimeline = timeline;
				dist = tlDist;
			}
		}
		/*var addHover = this.addHover;
		if (hoveredTimeline) {
			tlY = hoveredTimeline.getLineOffset();
			addHover.show();
			var below = (mouseY > tlY);
			addHover.top(tlY + (below ? 0 : -31));
			addHover.left(ev.clientX - 10);
			addHover.setBelow(below);
		} else {
			addHover.hide();
		}*/
	}
};



UI.prototype._getTimePosition = function(time) {
	return Math.round(this._midpoint + time.compare(this.center) * this._timeToPx);	
};
UI.prototype._getPositionTime = function(pos) {
	var tdiff = Math.round((pos - this._midpoint) / this._timeToPx);
	//var tdiff = Math.floor((pos - this._midpoint) / this._timeToPx);
	return this.center.clone().addDays(tdiff);
};

UI.prototype.hasEvent = function(event) {
	return event && event.id && this._eventBoxes[event.id];
};	

UI.prototype.addEvent = function(event) {
	if (!this.hasEvent(event)) {
		var eventBox = this.createEventBox(event);
		eventBox.left(this._getTimePosition(event.time));
		var myBounds = eventBox.getBounds();

		var space = [];
		var boxes = this.getVisibleEventBoxes();
		var impactors = {};
		for (var id in boxes) {
			var box = boxes[id];
			var bounds = box.getBounds();
			var impact = 0;
			var yPos = bounds.top;
			if (bounds.right > myBounds.left && bounds.left < myBounds.left) {
				// Other box impacts us at the left
				impact = bounds.right - myBounds.left;
			} else if (bounds.left < myBounds.right && bounds.right > myBounds.right) {
				// Other box impacts us at the right
				impact = myBounds.right - bounds.left;
			}
			if (impact) {
				if (!impactors[yPos]) {
					impactors[yPos] = [];
				}
				impactors[yPos].push({box:box,impact:impact});
			}
		}
		var eligliblePositions = [0,32,64,96,128,160,192,224,256,288];
		var finalPosition = 300;
		for (var i=0; i<eligliblePositions.length; i++) {
			var y = eligliblePositions[i];
			if (!(y in impactors)) {
				finalPosition = y;
				break;
			}
		}

		eventBox.top(finalPosition);
	}
};

UI.prototype.removeEvent = function(event) {
	if (this.hasEvent(event)) {
		this._eventBoxes[event.id].dispose();
		delete this._eventBoxes[event.id];
	} else if (this._editingBox.event === event) {
		this._editingBox.dispose();
		this._editingBox = null;
	}
};

UI.prototype.setEvents = function(events) {
	var event, id;
	if (events instanceof Array) {
		var hash = {};
		for (var i=0; i<events.length; i++) {
			event = events[i];
			if (event && event.id) {
				hash[event.id] = event;
			}
		}
		events = hash;
	}
	if (events instanceof Object) {
		var addEvents = {},
			delEvents = {};

		for (id in events) {
			event = events[id];
			if (event && !this._eventBoxes[id]) {
				addEvents[id] = event;
			}
		}
		for (id in this._eventBoxes) {
			event = this._eventBoxes[id].event;
			if (event && !events[id]) {
				delEvents[id] = event;
			}
		}
		for (id in addEvents) {
			this.addEvent(addEvents[id]);
		}
		for (id in delEvents) {
			this.removeEvent(delEvents[id]);
		}
	}
};


UI.prototype.getLineDest = function() {
	return this._lineContainer.offset().top + this._lineContainer.height()/2 - 1;
};

UI.prototype.createEventBox = function(event) {
	var eventBox = new EventBox({parent:this,event:event});
	if (event.id === null) {
		this._editingBox = eventBox;
	} else {
		this._eventBoxes[event.id] = eventBox;
	}
	return eventBox;
};


UI.prototype.getEventBoxesInRange = function(timeStart, timeEnd) {

};
UI.prototype.getVisibleEventBoxes = function() {
	return this._eventBoxes;
};
