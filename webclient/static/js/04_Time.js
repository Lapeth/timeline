// Requirements:

// Get rep. of Time + 1 year, Time + 10 years, Time + 1 day etc.
// Extract full year
// Roundoff year to prev/next 10/100/1000 years
// Get number of days between two instances
// Compare two instances wrt precedence and equality


Time = function(year, month, day){
	month--; // Convert month 1-12 to month 0-11
	// Some data that can represent any date since the beginning of the universe, till the end (basically in the range of tens of billions of years)
	this.year = year; // Years. Any Integer. BC years are numbered one more (so 5 BC is -4, 13 BC is -12). The year 1BC (denoted 0) is immediately followed by 1AD (denoted 1)
	var isLeapYear = Time.isLeapYear(year);
	for (var priorDays = 0; month > 0; month--) {
		priorDays += Time.getMonthLength(month-1, isLeapYear);
	}
	if (day === null) {
		this.day = null;
	} else {
		if (day < 0) {
			console.trace();
			throw "negative days disallowed";
		}
		this.day = priorDays + day; // Integer counting from new year. January 1st is 1
	}
};

Time.now = function(){
	var now = new Date();
	return new Time(now.getFullYear(), now.getMonth()+1, now.getDate());
};

Time.prototype.clone = function(){
	return new Time(this.year, 0, this.day);
};
Time.MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
Time.MONTH_LENGTHS = [31,28,31,30,31,30,31,31,30,31,30,31];
Time.MONTH_LENGTHS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31];

Time.getMonthLength = function(month, isLeapYear) {
	if (month < 0) {
		month = 12 + (month % 12);
	}
	if (month >= 12) {
		month = month % 12;
	}
	var monthArray = isLeapYear===true ? Time.MONTH_LENGTHS_LEAP : Time.MONTH_LENGTHS;
	return monthArray[month];
};
Time.prototype.getMonthLength = function(month) {
	return Time.getMonthLength(month, this.isLeapYear());
};

Time.getYearLength = function(year) {
	return Time.isLeapYear(year) ? 366 : 365;
};
Time.prototype.getYearLength = function() {
	return this.isLeapYear() ? 366 : 365;
};


Time.isLeapYear = function(year) {
	if (year % 400 === 0) return true;
	if (year % 100 === 0) return false;
	if (year % 4 === 0) return true;
	return false;
};
Time.prototype.isLeapYear = function(){
	return Time.isLeapYear(this.year);
};

Time.prototype.getMonth = function(){
	if (this.day === null) {
		return null;
	} else {
		for (var month=0, day=this.day; month<12 && day>0; month++) {
			day -= this.getMonthLength(month);
		}
		return month-1;
	}
};

Time.prototype.getDate = function(){
	if (this.day === null) {
		return null;
	} else {
		for (var month=0, day=this.day; month<12 && day>0; month++) {
			var monthLength = this.getMonthLength(month);
			if (day <= monthLength) {
				return day;
			}
			day -= monthLength;
		}
	}
};

Time.prototype.getFullYear = function(){
	return this.year;
};
Time.prototype.getDay = function(){
	return this.day;
};

Time.prototype.readable = function(){
	if (this.year > 0) {
		return [this.getDate(), this.getMonth()+1, this.year].join(".");
	} else if (this.year > -1000) {
		return [this.getDate(), this.getMonth()+1, 1-this.year].join(".") + " BC";
	} else {
		return 1-this.year + " BC";
	}
};




Time.prototype.addDays = function(days){
	if (this.day !== null) {
		
		// Move a number of days to this.day until we hit a year limit, storing any surplus days
		var daysInYear = this.getYearLength();
		this.day += days;
		days = 0;
		if (this.day > daysInYear) {
			days = this.day - daysInYear;
			this.day = 1;
			this.year++;
		} else if (this.day < 0) {
			days = this.day;
			this.day = 1;
		} else if (this.day == 0) {
			this.day = Time.getYearLength(this.year-1);
			this.year--;
		}
		
		
		
		if (days !== 0) {
			var daysInBlock = 400 * 365 + 97;
			if (days < 0) {
				if (-days > daysInBlock) {
					var blocks = Math.floor(-days / daysInBlock);
					this.year -= 400 * blocks;
					days += blocks * daysInBlock;
				}
				while (days < 0) {
					var daysInYear = Time.getYearLength(this.year-1);
					if (-days > daysInYear) {
						days += daysInYear;
						this.year--;
					} else {
						this.day = daysInYear + days;
						this.year--;
						days = 0;
					}
				}
			} else {
				var daysInYear = this.getYearLength();
				if (days > daysInYear && days > daysInBlock) {
					var blocks = Math.floor(days / daysInBlock);
					this.year += 400 * blocks;
					days -= blocks * daysInBlock;
				}
				// Naive approach
				while (days > 0) {
					var daysInYear = this.getYearLength();
					if (days > daysInYear) {
						days -= daysInYear;
						this.year++;
					} else {
						this.day = days;
						days = 0;
					}
				}
			}
		}
	}
	//console.log(this.year,this.day);
	return this;
};

Time.prototype.addMonths = function(months){
	if (this.day !== null) {
		// Add or subtracts an integer number of months
		var years = months > 0 ? Math.floor(months / 12) : Math.ceil(months / 12);
		months = months % 12;
		if (months < 0) {
			years--;
			months += 12;
		}
		if (years) {
			this.addYears(years);
		}
		var thisMonth = this.getMonth();
		var days = 0;
		for (var i=0; i<months; i++) {
			days += Time.getMonthLength(thisMonth+i, this.isLeapYear());
		}
		this.day += days;
		var daysInYear = this.getYearLength();
		if (this.day > daysInYear) {
			this.day -= daysInYear;
			this.addYears(1);
		}
	}
	return this;
};

Time.prototype.addYears = function(years){
	// Add or subtracts an integer number of years
	this.year += years;
	return this;
};



Time.prototype.floorMonths = function(){
	if (this.day !== null) {
		// Set to the beginning of the represented month
		var d = 0;
		for (var month=0, day=0; day<this.day; month++) {
			d = day;
			day += this.getMonthLength(month);
		}
		this.day = d;
	}
	return this;
};
Time.prototype.ceilMonths = function(){
	if (this.day !== null) {
		// Set to the beginning of the month following the represented month
		for (var month=0, day=0; day<this.day; month++) {
			day += this.getMonthLength(month);
		}
		//console.log("ceilMonths, set day from",this.day,"to",day);
		this.day = day;
	}
	return this;
};
Time.prototype.floorYears = function(roundDigits){
	// Set to the beginning of the represented year
	this.day = this.day===null ? null : 1;
	if (typeof(roundDigits) === "number" && roundDigits > 0) {
		var exp = Math.pow(10, roundDigits);
		this.year = Math.floor(this.year / exp) * exp;
	}
	return this;
};
Time.prototype.ceilYears = function(roundDigits){
	// Set to the beginning of the year following the represented year
	this.day = this.day===null ? null : 1;
	if (typeof(roundDigits) === "number" && roundDigits > 0) {
		var exp = Math.pow(10, roundDigits);
		this.year = Math.ceil(this.year / exp) * exp;
	} else {
		this.year++;
	}
	return this;
};


Time.prototype.isBefore = function(time) {
	return (this.year < time.year || (this.day !== null && this.year === time.year && this.day < time.day));
};
Time.prototype.isSame = function(time) {
	return this.year === time.year && this.day === time.day;
};
Time.prototype.isAfter = function(time) {
	return (this.year > time.year || (this.day !== null && this.year === time.year && this.day > time.day));
};
Time.prototype.compare = function(time) {
	if (this.day !== null && time !== null) {
		// Returns the interval between the dates
		var isBefore = this.isBefore(time);
		var first = isBefore ? this : time;
		var last = isBefore ? time : this;

		var days = last.day - first.day;
		if (first.year !== last.year) {
			var year = first.year;
			var blocks = Math.floor((last.year - year) / 400);
			if (blocks) {
				days += blocks * 146097; //400 * 365 + 97;
				year += blocks * 400;
			}
			for ( ; year < last.year; year++) {
				days += Time.getYearLength(year);
			}
		}
		return isBefore ? -days : days;
	}
};
