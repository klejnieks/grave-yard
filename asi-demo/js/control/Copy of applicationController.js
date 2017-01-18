define(['jquery','can', 'js/control/router'], function($, can, router) {

	var applicationController = can.Control({
		
		defaults: {
			view: "views/homeView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.element.html(can.view(self.options.view));
			new router();
			
			can.route.bind('change', function(ev, attr, how, newVal, oldVal) {
				debugger;
			});
		},
		
		"route": function(data) {
			debugger;
			console.log(data);
		},
		
		":page route": function(data) {
			debugger;
			console.log(data);
		},
		
		"nested route": function(data) {
			debugger;
			console.log(data);
		},
		
		":page/:subpage route": function(data) {
			debugger;
			console.log(data);
		}

	});
	
	return applicationController;
 
});


