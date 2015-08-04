Filter = function(parent) {
	if (!arguments.length) {
		return;
	}
	this.parent = parent;
	this.id = Filter._nextId++;
	Filter._byId[this.id] = this;
	this.data = {};
}

Filter._nextId = 0;
Filter._byId = {};

Filter.getById = function(id){
	return this._byId[id];
}

Filter.prototype.getQuery = function(){
	return "";
}
Filter.prototype.getData = function(key){
	return this.data[key];
}
Filter.prototype.setData = function(key, value){
	this.data[key] = value;
}
Filter.prototype.remove = function() {
	if (this.parent) {
		this.parent.removeFilter(this);
	}
}
Filter.prototype.setParent = function(parent, forceNewPos){
	if (this.parent && (this.parent !== parent || forceNewPos)) {
		this.parent.removeFilter(this);
	}
	if (parent instanceof CompoundFilter) {
		parent.addFilter(this);
	}
}
Filter.prototype.isEmpty = function() {
	return false;
}

CategoryFilter = function(parent, tagname, dbId){
	Filter.call(this, parent);
	this.tagname = tagname;
	this.dbId = dbId;
}

CategoryFilter.prototype = new Filter;

CategoryFilter.prototype.getQuery = function(){
	return this.dbId;
}



CompoundFilter = function(parent, subfilters){
	if (!arguments.length) {
		return;
	}
	Filter.call(this, parent);
	this.subfilters = [];
	if (subfilters) {
		for (var i=0; i<subfilters.length; i++) {
			this.addFilter(subfilters[i]);
		}
	}
}
CompoundFilter.prototype.getQuery = function(){
	/*if (this.queryDescriptor) {
		if (this.subfilters.length === 0) {
			return "";
		} else if (this.subfilters.length === 1) {
			return this.subfilters[0].getQuery();
		} else {
			var items = [];
			for (var i=0; i<this.subfilters.length; i++) {
				items[i] = this.subfilters[i].getQuery();
			}
			var obj = {};
			obj[this.queryDescriptor] = items;
			return obj;
		}
	} else {
		return null;
	}*/
	if (this.queryDescriptor) {
		if (this.subfilters.length === 0) {
			return "";
		} else if (this.subfilters.length === 1) {
			return this.subfilters[0].getQuery();
		} else {
			var items = [];
			for (var i=0; i<this.subfilters.length; i++) {
				items[i] = this.subfilters[i].getQuery();
			}
			//return "(" + items.join(this.queryDescriptor) + ")";
			return items.join(this.queryDescriptor);
		}
	} else {
		return "";
	}
}
CompoundFilter.prototype.addFilter = function(subfilter, forceNewPos){
	if (subfilter.parent && (subfilter.parent !== this || forceNewPos)) {
		subfilter.parent.removeFilter(subfilter);
	}
	if (!Util.array.contains(this.subfilters, subfilter)) {
		this.subfilters.push(subfilter);
		subfilter.parent = this;
		this._onUpdate();
	}
}
CompoundFilter.prototype.removeFilter = function(subfilter){
	if (Util.array.contains(this.subfilters, subfilter)) {
		Util.array.remove(this.subfilters, subfilter);
		subfilter.parent = null;
		this._onUpdate();
	}
}

CompoundFilter.prototype.removeAllFilters = function(){
	if (this.subfilters.length) {
		for (var i=0; i<this.subfilters.length; i++) {
			this.subfilters[i].parent = null;
		}
		this.subfilters.length = 0;
		this._onUpdate();
	}
}

CompoundFilter.prototype.addUpdateCallback = function(callback){
	if (!this._updateCallbacks) {
		this._updateCallbacks = [];
	}
	this._updateCallbacks.push(callback);
}

CompoundFilter.prototype.isEmpty = function(){
	for (var i=0; i<this.subfilters.length; i++) {
		if (!this.subfilters[i].isEmpty()) {
			return false;
		}
	}
	return true;
}


CompoundFilter.prototype._onUpdate = function(){
	if (this.parent) {
		this.parent._onUpdate();
	}
	if (this._updateCallbacks) {
		for (var i=0; i<this._updateCallbacks.length; i++) {
			this._updateCallbacks[i](this);
		}
	}
}



AndFilter = function(parent, subfilters){
	CompoundFilter.call(this, parent, subfilters);
}

AndFilter.prototype = new CompoundFilter;
AndFilter.prototype.querySeparator = " && ";
AndFilter.prototype.queryDescriptor = "a";

/*
OrFilter = function(parent, subfilters){
	CompoundFilter.call(this, parent, subfilters);
}

OrFilter.prototype = new CompoundFilter;
OrFilter.prototype.querySeparator = " || ";
OrFilter.prototype.queryDescriptor = "o";
*/