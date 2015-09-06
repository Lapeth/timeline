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
            var u = $.isFunction(_url) ? _url(jq) : _url;
            if (u && jq && jq.val().length) {
                keytimer = setTimeout(function(){
                    if (latestRequest) {
                        latestRequest.abort();
                        latestRequest = null;
                    }
                    latestRequest = $.ajax({
                        url: u,
                        dataType: "json",
                        success: function(responseText, status, response){
                            _action.call(jq, !!_interpreter.call(jq, response.responseJSON), false, response.responseJSON);
                        }.bind(this),
                        complete : function() {
                            latestRequest = null;
                        }.bind(this)
                    });
                    
                }.bind(this),0);
            } else {
                if (latestRequest) {
                    latestRequest.abort();
                    latestRequest = null;
                }
                _action.call(jq, false, true, null);
            }
        };
        this.keyup(run);
        this.change(run);
        $(run);
    }
});