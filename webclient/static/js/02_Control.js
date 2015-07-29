Control = function(param){
	if (!arguments.length) return;
	
	var el = this._el = param.el || document.createElement("div");
	el.id = this._id = param.el && param.el.id || param.id || Control.nextId();
	el.className = this.getClassName();
	this._jel = $(el);
	
	if (param.addToBody) {
		document.body.appendChild(el);
	} else {
		var parent = this._parent = param.parent;
		if (parent) {
			parent.addChild(this);
		}
	}
	this._children = [];
};

Item.inherit(Control, Item);
Control.className = "Control";

Control.__nextId = 0;
Control.nextId = function(){
	return "C" + (++Control.__nextId);
};

Control.prototype.getClassName = function(){
	var css = [];
	for (var cls = this.constructor; cls; cls = cls.super) {
		if (cls.className) {
			css.push(cls.className);
		}
	}
	return css.join(" ");
};

Control.prototype.toString = function(){
	return this.constructor.className;
};

Control.prototype.getElement = function(){
	return this._el;
};
Control.prototype.getContainer = function(){
	return this._jel;
};
Control.prototype.getJQuery = function(){
	return this._jel;
};
//------------------------------------------------------------------------------

Control.prototype.dispose = function(){
	this._jel.remove();
	this._disposed = true;
	if (this._parent) {
		this._parent.removeChild(this);
	}
};
Control.prototype.getDisposed = function(){
	return !!this._disposed;
};

Control.prototype.addChild = function(child){
	this._children.push(child);
	this.getContainer(child).append(child.getElement());
};
Control.prototype.removeChild = function(child){
	if (child && child.getDisposed()) {
		Util.array.remove(this._children, child);
	} else {
		child.dispose();
	}
};

//------------------------------------------------------------------------------

(function(){
	var transferredMethods = [
		"addClass","css","hasClass","toggleClass","removeClass",
		"on","click","dblclick","mouseover","mouseenter","mouseout","mouseleave","mousemove","mousedown","mouseup","scroll",
		"keydown","keypress","keyup",
		"focus","blur","focusin","focusout",
		"scrollLeft","scrollTop",
		"offset",
		"width","height","innerWidth","innerHeight","outerWidth","outerHeight",
		"hide","show","animate","stop","fadeIn","fadeOut"];
	for (var i=0; i<transferredMethods.length; i++) {
		var methodName = transferredMethods[i];
		(function(methodName){
			Control.prototype[methodName] = function(){
				return this._jel[methodName].apply(this._jel, arguments);
			};
		})(methodName);
	}
})();

Control.prototype.top = function(top) {
	if (top!==undefined) {
		this._jel.css({top:top+"px"});
	} else {
		return this._jel.position().top;
	}
};
Control.prototype.left = function(left) {
	if (left!==undefined) {
		this._jel.css({left:left+"px"});
	} else {
		return this._jel.position().left;
	}
};
Control.prototype.opClass = function(set, className) {
	if (set) {
		this.addClass(className);
	} else {
		this.removeClass(className);
	}
}


//------------------------------------------------------------------------------

Control.prototype.render = function(){
};

Control.prototype.createElement = function(nodeName, id, className, append) {
	var element = document.createElement(nodeName || "div");
	if (id) {
		element.id = id;
	}
	if (className) {
		element.className = className;
	}
	var parent = append===true ? this : append;
	if (parent instanceof Control) {
		parent = parent.getElement();
	}
	if (parent instanceof Element) {
		parent.appendChild(element);
	}
	if (parent instanceof jQuery) {
		parent.append(element);
	}
	return $(element);
};
