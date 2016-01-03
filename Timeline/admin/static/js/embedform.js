(function(){
    if (window._timeline_form_) {
        window._timeline_form_.show();
    } else {
        params = {
            header: 0
        };
        
        var paramList = [];
        for (var key in params) {
            var value = params[key];
            if (value instanceof Array) {
                for (var i=0; i<value.length; i++) {
                    paramList.push(key+"="+value[i]);
                }
            } else {
                paramList.push(key+"="+value);
            }
        }
        var paramString = paramList.join("&");
        
        
        var maxZindex = 2147483647;
        var width = 800;
        var height = 400;
        var padding = 10;
        
        var container = document.createElement("div");
        container.style = ["position: fixed",
                           "left: 50%",
                           "top: 50%",
                           "margin-left: "+(-(width>>1))+"px",
                           "margin-top: "+(-(height>>1))+"px",
                           "width: "+(width)+"px",
                           "height: "+(height)+"px",
                           "padding: "+padding+"px",
                           "background: #fff",
                           "border: 1px solid #333",
                           "-moz-border-radius: "+padding+"px",
                           "border-radius: "+padding+"px;",
                           "box-shadow: 0px 0px 8px #888",
                           "z-index: " + maxZindex
                           ].join(";");
        document.body.appendChild(container);
        
        var frame = document.createElement("iframe");
        frame.style = ["border: 0",
                       "width: "+width+"px",
                       "height: "+height+"px"].join(";");
        frame.src = "//localhost:8000/admin/event/create?" + paramString;
        container.appendChild(frame);
        
        
        var backdrop = document.createElement("div");
        backdrop.style = ["position: fixed",
                          "top: 0",
                          "left: 0",
                          "width: 100%",
                          "height: 100%",
                          "background: #fff",
                          "opacity: 0.5",
                          "z-index: " + (maxZindex-1)].join(";");
        
        var hide = function(){
            container.style.display = backdrop.style.display = "none";
        }
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener("click", hide);
        
        window._timeline_form_ = {
            container: container,
            frame: frame,
            backdrop: backdrop,
            show: function() {
                this.container.style.display = this.backdrop.style.display = "block";
            }
        };
    }
})();