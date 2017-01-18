define(['jquery','can', 'eventManager'], function($, can, eventManager) {

	var applicationController = can.Control({
		
		defaults: {
			view: "views/homeView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.element.html(can.view(self.options.view));
			//can.route(":Home");
			
			//can.route.bind('change', function(ev, attr, how, newVal, oldVal) {
				//debugger;
			//}),
			
			
			//eventManager.addEventListener("searchAndDestroyEventBus", this.searchAndDestroyEventBus, this);
			//can.event.on("searchAndDestroyCanEvent", this.searchAndDestroyCanEvent);
			can.addEvent("searchAndDestroyCanEvent", this.searchAndDestroyCanEvent);
			
			
			setInterval(self.dispatchEventsTest, 1000);
		},
		
		dispatchEventsTest: function() {
			console.log("dispatch events test called");
			
			var data =  [{"name":"klejnieks"}];

			//eventManager.dispatch("searchAndDestroyEventBus", obj, {});
			
			can.dispatch("searchAndDestroyCanEvent", data);
		},
		
		searchAndDestroyEventBus: function(obj) {
			var myName = obj.target.name;
			debugger;
		},
		
		searchAndDestroyCanEvent: function(obj) {
			var myName = obj.name;
			debugger;
		},
		
		
		
		
		
		
		initRouter: function() {
			alert("init router");
			can.route.ready();
		},
		
		"route": function(data) {
    		debugger;
    	},
    	
		"{can.route} change" : function(a, b, c, d) { 
			debugger;
		},

	});
	
	return applicationController;
 
});


