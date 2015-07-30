$.fn.extend({chooser:function(cfg){
    
    var self = this;
    
    var defaultSort = function(itemA, itemB){
        var a = itemA.innerHTML;
            b = itemB.innerHTML;
        return defaultValueSort(a, b);
    },
    
    defaultValueSort = function(valueA, valueB) {
        return valueA == valueB ? 0 : (valueA < valueB ? -1 : 1);
    };
    
    
    var config = cfg || {};
    
    var chooser = this.chooser = {
        selected : this.find(".chooser-selected"),
        available : this.find(".chooser-available"),
        search : this.find(".chooser-search"),
        transferOn : this.find(".chooser-transfer-on"),
        transferOff : this.find(".chooser-transfer-off"),
        
        transfer : function(from, to, event) {
            event.preventDefault();
            to.append(from.find("option:selected"));
            chooser.sort(to);
            chooser.updateDataField();
            return false;
        },
        
        sort : function(select) {
            var sorted = select.find("option").sort(config.sort || defaultSort);
            select.append.apply(select, sorted);
        },
        
        updateDataField : function(){
            var values = [];
            var oldFields = self.find(".chooser-data");
            chooser.selected.find("option").each(function(){
                var existing = oldFields.filter("[value='"+this.value+"']");
                if (existing.length) {
                    oldFields = oldFields.not(existing);
                } else {
                    var dataField = document.createElement("input");
                    dataField.type = "hidden";
                    dataField.name = config.name || "chooserData";
                    dataField.value = this.value;
                    dataField.className = "chooser-data";
                    self.append(dataField);
                }
            });
            oldFields.remove();
        },
        
        getSelect : function(item) {
            return $(item).closest("select");
        },
        
        getOther : function(item) {
            var j = this.getSelect(item);
            if (this.selected.is(j)) {
                return this.available;
            } else {
                return this.selected;
            }
        }
    }
    
    chooser.transferOn.click(chooser.transfer.bind(this, chooser.available, chooser.selected));
    chooser.transferOff.click(chooser.transfer.bind(this, chooser.selected, chooser.available));
    
    this.find("select").dblclick(function(event){
        var target = event.target;
        if (event.target && event.target.nodeName=="OPTION") {
            var from, to;
            if (chooser.selected.is(this)) {
                from = chooser.selected;
                to = chooser.available;
            } else {
                from = chooser.available;
                
            }
            chooser.transfer(chooser.getSelect(this), chooser.getOther(this), event);
        }
    });
    chooser.updateDataField();
}});