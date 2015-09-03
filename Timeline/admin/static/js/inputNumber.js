$(function(){
    var inputs = $("input[type=number]");
    inputs.keypress(function(event){
        var code = event.charCode;
        if (!(code == 0 || (code >= 48 && code <= 57))) {
            event.preventDefault();
        }
    });
});