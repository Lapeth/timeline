$.fn.extend({
    check: function(url, interpreter, action){
        var keytimer,
            latestRequest,
            _url = url,
            _interpreter = interpreter || function(jsonObj) {
                return !!(jsonObj && jsonObj.length);
            },
            jq = $(this),
            _action = action || function(found, empty, json) {
                jq.toggleClass("taken", found);
            }
        var run = function(){
            if (keytimer) {
                clearTimeout(keytimer);
            }
            keytimer = setTimeout(function(){
                if (latestRequest) {
                    latestRequest.abort();
                    latestRequest = null;
                }
                if (jq.val().length) {
                    latestRequest = $.ajax({
                        url: $.isFunction(_url) ? _url(jq) : _url,
                        dataType: "json",
                        success: function(responseText, status, response){
                            _action.call(jq, !!_interpreter.call(jq, response.responseJSON), false, response.responseJSON);
                        }.bind(this),
                        complete : function() {
                            latestRequest = null;
                        }.bind(this)
                    });
                } else {
                    _action.call(jq, false, true);
                }
            }.bind(this),0);
        };
        this.keyup(run);
        this.change(run);
        $(run);
    }
});