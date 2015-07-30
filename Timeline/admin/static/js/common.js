$(function(){
    
    var onResize = function() {
        $(".verticalScroll").each(function(){
            var jq = $(this);
            jq.height(document.body.clientHeight - jq.offset().top);
        });
    }
    
    $(window).resize(onResize);
    onResize();
});

//-----------------------------------------------------------------------------

var Url = function(url){
    if (!arguments.length) {
        return;
    }
    var a = Util.split(url,"//",1);
    this.protocol = a.length > 1 ? a[0] : null;
    a = Util.split(a.length > 1 ? a[1] : a[0], "/", 1);
    this.host = a[0];
    this.params = {};
    this.path = "/";
    if (a.length > 1) {
        a = Util.split(a[1], "?", 1);
        this.path += a[0];
        a = a.length > 1 ? Util.split(a[1],"&") : [];
        for (var i=0; i<a.length; i++) {
            var s = Util.split(a[i], "=", 1);
            this.addParam(s[0], s[1]);
        }
    }
}

Url.prototype.toString = function() {
    var url = this.protocol + "//" + this.host + this.path;
    var args = [];
    for (var key in this.params) {
        var value = this.params[key];
        if ($.isArray(value)) {
            for (var i=0; i<value.length; i++) {
                args.push(key + "=" + value[i]);
            }
        } else {
            args.push(key + "=" + value);
        }
    }
    if (args.length) {
        url += "?" + args.join("&");
    }
    return url;
}

Url.prototype.param = function(key, value) {
    if (value === undefined) {
        return this.params[key];
    } else {
        this.params[key] = value;
        return this;
    }
}

Url.prototype.addParam = function(key, value) {
    if (key in this.params) {
        if (!$.isArray(this.params[key])) {
            this.params[key] = [this.params[key]];
        }
        this.params[key].push(value);
    } else {
        this.params[key] = value;
    }
    return this;
}

Url.prototype.copy = function(){
    var copy = new Url();
    copy.protocol = this.protocol;
    copy.host = this.host;
    copy.path = this.path;
    copy.params = Util.deepcopy(this.params);
    return copy;
}


//-----------------------------------------------------------------------------


var Util = {
    
    split : function(str, splitter, splits) {
        splitter = ""+splitter;
        var parts = str.split(splitter);
        if (splits !== undefined && splits > 0) {
            for (var i=splits+1; i<parts.length; i++) {
                parts[splits] += splitter + parts[i];
            }
            parts.length = splits + 1;
        }
        return parts;
    },
    
    deepcopy: function(item) {
        var copy = null;
        var type = typeof(item);
        if (type == "string" || type == "number" || type == "boolean") {
            copy = item;
        } else if (item instanceof Array) {
            copy = [];
            for (var i=0; i<item.length; i++) {
                copy[i] = Util.deepcopy(item[i]);
            }
        } else if (item instanceof Object) {
            copy = {};
            for (var key in item) {
                copy[key] = Util.deepcopy(item[key]);
            }
        }
        return copy;
    }
};
