Timeline = function(param){
	Control.call(this,param);
	this.reset();
	this._years = {};
	this.hoverbox = this.createElement("div", "canvashover", null, true);
	this.on("mousemove",this.showHover.bind(this));
	this.on("mouseout",this.hideHover.bind(this));
};


Item.inherit(Timeline, Control);
Timeline.className = "Timeline";

Timeline.prototype.reset = function(){
	if (this._canvas) {
		$(this._canvas).remove();
	}
	var canvas = this._canvas = this.createElement("canvas","canvas",null,true).get(0);
	canvas.width = 3 * $(document.body).width();
	canvas.height = this.height();
	canvas.style.left = -$(document.body).width();
	canvas.style.position = "absolute";
	this.ctx = this._canvas.getContext("2d");
};

Timeline.RESOLUTION = {
	days: {
		markerMax: 10,
		markerMin: 0,
		labelMax: 3,
		labelMin: 0
	},
	months: {
		markerMax: 300,
		markerMin: 0,
		labelMax: 100,
		labelMin: 0
	},
	years: {
		markerMax: 3650,
		markerMin: 10,
		labelMax: 1000,
		labelMin: 15
	},
	more: {
		markerMax: 3650,
		markerMin: 10,
		labelMax: 1000,
		labelMin: 100
	}
};
	

Timeline.VISIBLE_DAYS_RESOLUTION = 10;
Timeline.VISIBLE_DAYS_LABEL_RESOLUTION = 3;
Timeline.VISIBLE_MONTHS_RESOLUTION = 300;
Timeline.VISIBLE_MONTHS_LABEL_RESOLUTION = 100;
Timeline.VISIBLE_YEARS_RESOLUTION = 3650;
Timeline.VISIBLE_YEARS_LABEL_RESOLUTION = 1000;

Timeline.ONE_DAY = 24*60*60*1000

Timeline.prototype.set = function(resolution,center,animate) {
	this.resolution = resolution; // days per 100px
	this.invResolution = 1/resolution;
	this.center = center; // center date
	this.render();
};

Timeline.prototype.setResolution = function(resolution,animate) {
	this.resolution = resolution; // days per 100px
	this.invResolution = 1/resolution;
	for (var year in this._years) {
		this._years[year].dispose();
		delete this._years[year];
	}
	this.render();
};
Timeline.prototype.setCenter = function(center) {
	this.center = center;
	this.render();
};

Timeline.prototype.getLineOffset = function() {
	if (!this._lineOffset) {
		this._lineOffset = this.offset().top + this.height()/2;
	}
	return this._lineOffset;
};

// Return the number of pixels from the center date
Timeline.prototype.getDatePosition = function(date) {
	return 100 * date.compare(this.center) * this.invResolution;
};

Timeline.prototype.getPositionDate = function(xdist) {
	var daydist = xdist * this.resolution / 100;
	return this.center.clone().addDays(Math.floor(daydist));
};

Timeline.prototype.line = function(x1, y1, x2, y2){
	var ctx = this.ctx;
	ctx.save();
	ctx.strokeStyle = "#00000";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(Math.floor(x1) - 0.5, Math.floor(y1) - 0.5);
	ctx.lineTo(Math.floor(x2) - 0.5, Math.floor(y2) - 0.5);
	ctx.stroke();
	ctx.restore();
}

Timeline.prototype.text = function(text, x, y, style){

	var ctx = this.ctx;
	ctx.save();
	if (!style) {
		style = {};
	}
	
	var font = [];
	if (style.italic) {
		font.push("italic")
	}
	if (style.bold) {
		font.push("bold")
	}
	if (style.underline) {
		font.push("underline")
	}
	if (style.size) {
		font.push(style.size+"px");
	}
	if (style.font) {
		font.push(style.font);
	} else {
		font.push("sans-serif");
	}
	if (font.length) {
		ctx.font = font.join(" ");
	}
	
	if (style.align) {
		var size = ctx.measureText(text);
		var align = style.align.toLowerCase();
		if (align === "center") {
			x -= 0.5*size.width;
		} else if (align === "right") {
			x -= size.width;
		}
	}
	if (style.valign) {
		var height = style.size || 10;
		var align = style.valign.toLowerCase();
		if (align === "middle") {
			y += 0.5*height;
		} else if (align === "top") {
			y += height;
		}
	}
	ctx.fillText(text, Math.floor(x) - 0.5, Math.floor(y) - 0.5);	
	
	ctx.stroke();
	ctx.restore();
};

Timeline.formatPeriod = function(periodStart, periodSize){
	if (periodSize == 1 && periodStart >= 100 && periodStart < 10000) { // The 1980s, 470s 2010s etc.
		return periodStart + "s";
	}
	if (periodSize == 2 && periodStart >= -100000 && periodStart < 100000) {
		var isCE = periodStart >= 0;
		var century = Math.abs(periodStart / 100) + (isCE ? 1 : 0);
		var suffix = ["th","st","nd","rd","th","th","th","th","th","th"];
		return century + suffix[century % 10] + " century " + (isCE ? "AD":"BC")
	}
	if (periodSize == 3 && periodStart >= -100000 && periodStart < 100000) {
		var isCE = periodStart >= 0;
		var millenium = Math.abs(periodStart / 1000) + (isCE ? 1 : 0);
		var suffix = ["th","st","nd","rd","th","th","th","th","th","th"];
		return millenium + suffix[millenium % 10] + " millenium " + (isCE ? "AD":"BC")
	}

	return periodStart;
};

Timeline.prototype.render = function() {
	var ctx = this.ctx;
	var visibleWidth = this.width();
	var visibleHeight = this._canvas.height;
	var canvasWidth = this._canvas.width;
	var canvasHeight = this._canvas.height;
	
	// Clear the canvas
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.restore();
	
	// Draw the horizontal line
	var lineY = 0.5 * visibleHeight;
	this.line(0, lineY, canvasWidth, lineY);
	var visibleDayCount = canvasWidth * this.resolution * 0.01,
		halfVisibleTime = Math.round(visibleDayCount * 0.5),
		firstVisibleDay = this.center.clone().addDays(-halfVisibleTime),
		lastVisibleDay = this.center.clone().addDays(halfVisibleTime),
		firstVisibleMonth = firstVisibleDay.clone().floorMonths(),
		lastVisibleMonth = lastVisibleDay.clone().ceilMonths(),
		firstVisibleYear = firstVisibleDay.clone().floorYears(),
		lastVisibleYear = lastVisibleDay.clone().ceilYears();


	var resolution = this.resolution,
		limits = Timeline.RESOLUTION;


	var markerSizeLevels = [8, 6, 4, 4, 4, 4];
	var labelSizeLevels = [12, 10, 8, 8, 8, 8];
	var labelOffsetLevels = [16, 6, 8, 8, 8, 8];
	var level = 0;

	for (var e=9; e>0; e--) {
		var yearCount = Math.pow(10, e);

		var iter = (resolution < limits.more.markerMax * yearCount);

		if (iter) {
			
			var showMarkers = (resolution < limits.more.markerMax * yearCount) && (resolution > limits.more.markerMin * yearCount);
			var showLabels = (resolution < limits.more.labelMax * yearCount) && (resolution > limits.more.labelMin * yearCount);

			if (showMarkers) {
				var markerSize = markerSizeLevels[level];
				var labelSize = labelSizeLevels[level];
				var labelOffset = labelOffsetLevels[level];
				level++;
			}

			var item = firstVisibleYear.clone().floorYears(e);
			var itemOffset = Math.round(this.getDatePosition(item) + 0.5*canvasWidth);
			while (item.isBefore(lastVisibleDay)) {
				if (showMarkers) {
					this.line(itemOffset, lineY-markerSize, itemOffset, lineY+markerSize);
				}
				var nextItem = item.clone().addYears(yearCount);
				var nextItemOffset = Math.round(this.getDatePosition(nextItem) + 0.5*canvasWidth);
				if (showLabels) {
					var year = item.getFullYear(),
						label = Math.abs(year);
					if (Math.abs(year) > 10000) {
						if (e >= 9) {
							label = Math.floor(label / Math.pow(10,9)) + "G";
						} else if (e >= 6) {
							label = Math.floor(label / Math.pow(10,6)) + "M";
						} else if (e >= 3) {
							label = Math.floor(label / Math.pow(10,3)) + "K";
						}
					}
					label += (year < 0 ? " BC" : (year > 0 ? " AD" : ""));
					this.text(label, itemOffset, lineY-labelOffset, {align: "center", valign: "bottom", size:labelSize});
				}

				item = nextItem;
				itemOffset = nextItemOffset;
			}
			
		}
	}


	var iterYears = resolution < limits.years.markerMax,
		showYearMarkers = iterYears && resolution > limits.years.markerMin,
		showYearLabels = iterYears && resolution > limits.years.labelMin && resolution < limits.years.labelMax;

	var iterMonths = resolution < limits.months.markerMax,
		showMonthMarkers = iterMonths && resolution > limits.months.markerMin,
		showMonthLabels = iterMonths && resolution > limits.months.labelMin && resolution < limits.months.labelMax;

	var iterDays = resolution < limits.days.markerMax,
		showDayMarkers = iterDays && resolution > limits.days.markerMin,
		showDayLabels = iterDays && resolution > limits.days.labelMin && resolution < limits.days.labelMax;


	// Handle years and their constituents
	if (iterYears) {
		var year = firstVisibleYear;
		var yearOffset = Math.round(this.getDatePosition(year) + 0.5*canvasWidth);

		if (showYearMarkers) {
			var yearMarkerSize = markerSizeLevels[level];
			var yearLabelSize = labelSizeLevels[level];
			var yearLabelOffset = labelOffsetLevels[level];
			level++;
		}
		if (showMonthMarkers) {
			var monthMarkerSize = markerSizeLevels[level];
			var monthLabelSize = labelSizeLevels[level];
			var monthLabelOffset = labelOffsetLevels[level];
			level++;
		}
		if (showDayMarkers) {
			var dayMarkerSize = markerSizeLevels[level];
			var dayLabelSize = labelSizeLevels[level];
			var dayLabelOffset = labelOffsetLevels[level];
			level++;
		}

		while (year.isBefore(lastVisibleDay)) {
			var yearNumber = year.getFullYear();
			if (showYearMarkers) {
				this.line(yearOffset, lineY-yearMarkerSize, yearOffset, lineY+yearMarkerSize);
			}
			// Calculate for next year
			//var nextYear = new Date(yearNumber+1, 0, 1);
			var nextYear = year.clone().addYears(1);
			var nextYearOffset = Math.round(this.getDatePosition(nextYear) + 0.5*canvasWidth);
			
			if (showYearLabels) {
				// Put label halfway between the markers
				this.text(yearNumber, 0.5*(yearOffset + nextYearOffset), lineY-yearLabelOffset, {align: "center", valign: "bottom", size:yearLabelSize});
			}
			
			if (iterMonths) {
				var monthOffset = yearOffset;
				var month = year;
				for (var i=0; i<12; i++) {
					var nextMonth = month.clone().addMonths(1);
					if (month >= firstVisibleMonth && month <= lastVisibleMonth) {
						if (month == firstVisibleMonth && month != year) {
							monthOffset = Math.round(this.getDatePosition(month) + 0.5*canvasWidth);
						}
						if ((i > 0 || !showYearMarkers) && showMonthMarkers) {
							this.line(monthOffset, lineY-monthMarkerSize, monthOffset, lineY+monthMarkerSize);
						}
						var nextMonthOffset = Math.round(this.getDatePosition(nextMonth) + 0.5*canvasWidth);


						if (showMonthLabels) {
							this.text(Timeline.MONTH_NAMES_ABBR[i], 0.5*(monthOffset + nextMonthOffset), lineY-monthLabelOffset, {align: "center", valign: "bottom", size:monthLabelSize});
						}


						if (iterDays) {
							var dayOffset = monthOffset;
							var day = month;
							var daysInMonth = Timeline.MONTH_LENGTH[i];
							for (var j=0; j<daysInMonth; j++) {
								var dayNumber = j+1;
								var nextDay = day.clone().addDays(1);
								//console.log("day: ",day,day.readable(),"nextDay: ",nextDay,nextDay.readable());
								if (day >= firstVisibleDay && day <= lastVisibleDay) {
									var nextDayOffset = Math.round(this.getDatePosition(nextDay) + 0.5*canvasWidth);
									if (day == firstVisibleDay && day != month) {
										dayOffset = Math.round(this.getDatePosition(day) + 0.5*canvasWidth);
									}
									if ((j > 0 || !showMonthMarkers) && showDayMarkers) {
										this.line(dayOffset, lineY-dayMarkerSize, dayOffset, lineY+dayMarkerSize);
									}
									if (showDayLabels) {
										this.text(dayNumber, 0.5*(dayOffset + nextDayOffset), lineY-dayLabelOffset, {align: "center", valign: "bottom", size:dayLabelSize});
									}
									//console.log("monthNumber: ",i+1,"dayNumber: ",dayNumber, "dayOffset: ",dayOffset, "nextDayOffset: ",nextDayOffset,"diff: ",nextDayOffset-dayOffset);
									dayOffset = nextDayOffset;
								}
								day = nextDay;
							}
						}
					}
					month = nextMonth;
					monthOffset = nextMonthOffset;
				}
			}
			// Update current
			year = nextYear;
			yearOffset = nextYearOffset;
		}
	}
};




Timeline.MONTH_NAMES = [
	"Januar",
	"Februar",
	"Marts",
	"April",
	"Maj",
	"Juni",
	"Juli",
	"August",
	"September",
	"Oktober",
	"November",
	"December"
];

Timeline.MONTH_NAMES_ABBR = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Maj",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Okt",
	"Nov",
	"Dec"
];

Timeline.MONTH_LENGTH = [31,28,31,30,31,30,31,31,30,31,30,31];

Timeline.prototype.showHover = function(event){
	// this._canvas.width/6 = distance to center from left side of screen
	var hoveredDate = this.getPositionDate(event.clientX - this._canvas.width/6 - this.left());
	this.hoverbox.offset({left: event.clientX+10, top: event.clientY+2});
	this.hoverbox.text(hoveredDate.readable());
	this.hoverbox.show();
};

Timeline.prototype.hideHover = function(event){
	this.hoverbox.hide();
};