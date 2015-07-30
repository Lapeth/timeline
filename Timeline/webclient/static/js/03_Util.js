var Util = {

	array: {
		indexOf: function(array, member, strict) {
			for (var i=0; i<array.length; i++) {
				if ((strict && array[i]===member) || array[i]==member) {
					return i;
				}
			}
			return -1;
		},
		contains: function(array, member, strict) {
			return this.indexOf(array, member, strict) != -1;
		},
		remove: function(array, member){
			var index = this.indexOf(array, member);
			if (index != -1) {
				array.splice(index, 1);
			}
		}
	},

	hash: {
		copy: function(hash1) {
			var hash2 = {};
			for (var key in hash1) {
				hash2[key] = hash1[key];
			}
			return hash2;
		}
	},

	selection: {
		enable: function(el) {
			$(el).attr('unselectable','off')
				.css({'-moz-user-select':'text',
				'-o-user-select':'text',
				'-khtml-user-select':'text', /* you could also put this in a class */
				'-webkit-user-select':'text',/* and add the CSS class here instead */
				'-ms-user-select':'text',
				'user-select':'text'
			}).bind('selectstart', function(){ return true; });
		},
		disable: function(el) {
			$(el).attr('unselectable','on')
				.css({'-moz-user-select':'-moz-none',
				'-moz-user-select':'none',
				'-o-user-select':'none',
				'-khtml-user-select':'none', /* you could also put this in a class */
				'-webkit-user-select':'none',/* and add the CSS class here instead */
				'-ms-user-select':'none',
				'user-select':'none'
			}).bind('selectstart', function(){ return false; });
		}
	},

	string: {
		templateInsert: function(templateString, data, failIfNotFound) {
			var replaced = templateString.replace(/\$\{([^\}]+)\}/,function(matched, group1, offset, text){
				var parts = group1.split("."),
					current = data,
					i;
				for (i=0; i<parts.length; i++) {
					if (current[parts[i]]) {
						current = current[parts[i]];
					} else {
						break;
					}
				}
				return (i===parts.length) ? current : matched;
			});
			return failIfNotFound && replaced.match(/\$\{[^\}]+\}/) ? false : replaced;
		},
		
		unicodeEscape: function(str) {
			return str.replace(/./g,function(a){
				var v = a.codePointAt(0);
				return v < 128 ? a : "\\x"+v.toString(16);
			});
		}
	}
}
