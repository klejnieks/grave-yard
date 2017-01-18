define(['asi'], function(asi) {

	var applicationRouter = asi.Router({
		
	},{
		
		init : function(){
			
		},
		
		route: function(state, frag, something) {
			
			//for sake of simple example
			//Lets assume that Frag is 1:1 match of controller
			// Or Frag is evaluated and find the top most controller
			
			//for example http://...com/Orders/Pending/View
			
			//then the main controller would be "Orders"
			
			var mainController = frag.split("/")[0];
			
			require(["js/control/" + mainController + "Controller"], function(cntrl, el, frag) {
				new cntrl(el || "#main-content", frag); 
			}, function(err) {
				alert("controller: " + controller + "Controller does not exist");
			});
			
		}

	});

	return applicationRouter;
 
});


