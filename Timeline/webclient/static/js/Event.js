var Event = function(obj) {
	if (!arguments.length) {
		return;
	}
	this.id = obj.id || null;
	this.time = obj.time || new Time(obj.year, 0, obj.day);
	this.title = obj.title || "";
	this.text = obj.text || "";
	this.languageCode = obj.language || "en";
	this.wikipedia = obj.wiki || "";
};

Event.prototype._getJSONObject = function() {
	var obj = {
		title:this.title,
		text:this.text,
		wikipedia:this.wikipedia,
		year:this.time.getFullYear(),
		day:this.time.getDay()
	};
	if (this.id) {
		obj.id = this.id;
	}
	return obj;
}

Event.prototype.toJSON = function(){
	return JSON.stringify(this._getJSONObject());
}
