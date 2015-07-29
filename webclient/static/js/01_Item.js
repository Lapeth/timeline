Item = function(){

};


Item.inherit = function(subclass,superclass){
	subclass.prototype = new superclass;
	subclass.prototype.constructor = subclass;
	subclass.super = superclass;
	subclass.prototype.super = superclass.prototype;
}
