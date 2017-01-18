define(function(require) {
	
	var asi = require("asi");
	
	var NavigationController = asi.Control({
		
		defaults: {
			view: "views/navigationView.hbs"
		}
		
	},{
		
		init : function(){
		},
		
		"a click": function(selector, event) {
			event.stopImmediatePropagation();
			event.preventDefault();
			
			var customEvent = new asi.Event(asi.Event.UPDATE_COMPLETE, {path:selector.context.hash});
			asi.dispatch(customEvent);
			
			return false;
		}
	

	});

	return NavigationController;
 
});


