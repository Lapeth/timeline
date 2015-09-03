$.fn.extend({
	confirm: function(text) {
		this.attr("type", "button");
		this.click(function(){
			bootbox.confirm(text, function(result){
				if (result) {
					var form = this.parents("form");
					var name = this.attr("name");
					if (name) {
						var extraHidden = document.createElement("input");
						extraHidden.type = "hidden";
						extraHidden.name = name;
						extraHidden.value = this.val();
						form.append(extraHidden);
					}
					form.submit();
				}
			}.bind($(this)));
		});
	}	
});

$(function(){
	$("button.with-confirm").each(function(){
		var jq = $(this);
		var dialogText = jq.attr("data-dialog-text");
		if (dialogText) {
			jq.confirm(dialogText);
		}
	});
});
