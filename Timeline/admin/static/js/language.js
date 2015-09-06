var language = {

    getField : function(){
        if (!this._field) {
            this._field = $("input[name=language],select[name=language]").first();
        }
        return this._field;
    },

    get : function() {
        return this.getField().val();
    },

    change : function(listener) {
        this.getField().change(listener);
    }    
    
};