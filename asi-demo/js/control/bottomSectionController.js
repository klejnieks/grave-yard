define(['jquery','eventManager', 'js/control/ContactCardComponent', 'js/model/applicationModel', 'asi'], function($, eventManager, ContactCardComponent, applicationModel, asi) {
	
	var bottomSectionController = can.Control({
		
		defaults: {
			view: "views/bottomSectionView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.element.html(can.view(self.options.view));
		},
		
		"#test-1-btn click": function(evt) {
			var evt = new asi.Event(asi.Event.UPDATE_COMPLETE, {msg: "Test 1 ping result"});
			asi.dispatch(evt);
		},
		
		"#test-2-btn click": function(evt) {
			var evt = new asi.Event(asi.Event.UPDATE_COMPLETE, {msg: "Your Name is: " + $("#test-2-input").val() });
			asi.dispatch(evt);
		},

		"#test-3-btn click": function(evt) {
			//var evt = new CustomEvent('CustomEvent', {'detail': 'Kenneth Lejnieks'});
			
			var d = document;
			debugger;
   			
   			var evObj = document.createEventObject(window.event);
    		evt.srcElement.fireEvent('CustomEvent', evObj);
			
			
			//document.dispatchEvent(evt);
		}
		
	});
	
	return bottomSectionController;
 
});


