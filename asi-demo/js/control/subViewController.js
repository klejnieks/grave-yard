define(['jquery','eventManager', 'js/control/ContactCardComponent', 'js/model/applicationModel', 'asi'], function($, eventManager, ContactCardComponent, applicationModel, asi) {
	
	var subViewController = can.Control({
		
		defaults: {
			view: "views/subView.hbs"
		}
		
	},{
		
		init : function(){
			
			debugger;
			var test = asi.addEvent(asi.Event.UPDATE_COMPLETE, this.handler);
			debugger;
			setTimeout(this.mockDispatch, 5000);
		},
		
		mockDispatch: function() {
			//var customEvent = new asi.Event(asi.Event.UPDATE_COMPLETE, {name:"klejnieks"});
			debugger;
			asi.dispatch("dummy");
		},
		
		handler: function(obj) {
			console.log("sub view controller recieved event " + obj.type + " with data" + obj.data.name);
		}
		
	});
	
	return subViewController;
 
});


