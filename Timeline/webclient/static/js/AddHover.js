AddHover = function(param){
	Control.call(this,param);
	this.click(this.activate.bind(this));
	this.ui = param.parent;
};

Item.inherit(AddHover, Control);
AddHover.className = "AddHover";

AddHover.prototype.setBelow = function(below) {
	this._below = below;
	this.toggleClass("above", !below);
	this.toggleClass("below", below);
};

AddHover.prototype.activate = function(ev) {
	this.ui.openEditor(null, ev.clientX);
};
