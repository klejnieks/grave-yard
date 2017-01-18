define(['jquery', 'can'], function($, can) {
	
	var Router = can.Control({

		init: function() {
			console.log('router init');
		},
		
		//ROUTES
		'route' : function(data) {
			debugger;
		},

		"{can.route} change" : function(a, b, c, d) { 
			debugger;
		}
		
	});

	return Router;

});
