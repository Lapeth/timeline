FilterDialog = function(param){
	Control.call(this,param);
	this._input = this.createElement("input",null,"FilterInput",true);
	this._input.attr("placeholder", "Search");
	this._filterContainer = this.createElement("div",null,"FilterContainer",true);
	this._languageChooser = this.createElement("select","language",null,true);
	this._topFilter = new AndFilter(null, null);
	this._language = window.language.current || "en";
	this._topFilter.addUpdateCallback(function(filter) {
		if (filter.isEmpty()) {
			window.ui.setEvents([]);
		} else {
			$.ajax({
				url: "/event/",
				data: { t: filter.getQuery() },
				dataType: "json",
				//processData: false,
				//contentType: "application/json",
				complete: function(response){
					if (response.responseJSON instanceof Array) {
						var rawEvents = response.responseJSON,
							parsedEvents = [];
						for (var i=0; i<rawEvents.length; i++) {
							parsedEvents[i] = new Event(rawEvents[i]);
						}
						window.ui.setEvents(parsedEvents);
					}
				}
			});
		}
	}.bind(this));

	this.mousedown(this.onMouseDown.bind(this));

	this._labelMap = {};

	this._input.autocomplete({
		source: function(request, response) {
			$.ajax({
				url: "/tag/",
				data: { q: request.term, l: this._language },
				dataType: "json",
				complete: function(resp){
					if (resp && resp.status === 200) {
						var items = resp.responseJSON,
							titles = [];
						for (var i=0; i<items.length; i++) {
							var item = items[i];
							if (item.title && item.id) {
								this._labelMap[item.title] = item.id;
								titles.push(item.title);
							}
						}
						response(titles);
					}
				}.bind(this),
				error: function(resp) {
					if (window.console && console.error) {
						console.error(resp.status + ": " + resp.statusText);
					}
					response([]);
				}
			});
		}.bind(this),
		select: function(event, ui){
			this._addFilter(ui.item.value);
			this._input.val("");
			return false;
		}.bind(this)
	});
	
	if (window.language && window.language.available) {
		for (var i=0; i<window.language.available.length; i++) {
			var language = window.language.available[i];
			var option = this.createElement("option", null, null, this._languageChooser);
			option.attr("value", language.code);
			option.text(language.name);
			if (language.code === window.language.current) {
				option.attr("selected","selected");
			}
		}
	}
	this._languageChooser.change(function(event) {
		this.changeLanguage(event.target.value);
	}.bind(this));
	
	
	this.layout();
	$(window).resize(this.layout.bind(this));
};

Item.inherit(FilterDialog, Control);
FilterDialog.className = "FilterDialog";

FilterDialog.prototype._addFilter = function(tagname) {
	var dbId = this._labelMap[tagname];
	var filter = new CategoryFilter(this._topFilter, tagname, dbId);
	var filterBox = this.createElement("div", "Filter"+filter.id, "Filter", this._filterContainer);
	var filterLabel = this.createElement("div", null, "FilterLabel", filterBox);
	filterLabel.text(tagname);
	filterLabel.data("filter", filter);
	filter.setData("uiElement", filterLabel);
	this._topFilter.addFilter(filter);

	var deleteButton = this.createElement("button", null, "FilterDelete", filterBox);
	deleteButton.click(this._removeFilter.bind(this, filter.id));
}

FilterDialog.prototype._removeFilter = function(filterId) {
	var element = $("#Filter"+filterId);
	var filter = Filter.getById(filterId);
	if (element) {
		element.remove();
	}
	if (filter) {
		filter.remove();
	}
}
FilterDialog.prototype._removeAllFilters = function() {
	this._filterContainer.empty();
	this._topFilter.removeAllFilters();
}

FilterDialog.prototype.onMouseDown = function(ev) {
	ev.stopPropagation();
}

FilterDialog.prototype.onListUpdate = function() {
	var filterElements = this._filterContainer.find(".Filter");
	for (var i=0; i<filterElements.length; i++) {
		var filterElement = $(filterElements[i]),
			parentElement = filterElement.parent(),
			filter = filterElement.data("filter"),
			parent = (parentElement.is(this._filterContainer)) ? this._topFilter : parentElement.data("filter");
		filter.setParent(parent, true);
	}
}

FilterDialog.prototype.layout = function() {
	this._filterContainer.height(this.height() - this._input.outerHeight(true) - this._languageChooser.outerHeight(true));
}

FilterDialog.prototype.changeLanguage = function(newLanguageCode) {
	this._removeAllFilters();
	this._language = newLanguageCode;
	console.log(this._language);
	Util.cookie.set("language", newLanguageCode);
}