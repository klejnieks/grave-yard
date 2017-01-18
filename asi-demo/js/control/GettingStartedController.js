define(function(require) {

	var asi = require("asi");
	
	var GettingStartedController = asi.Control({
		
		defaults: {
			view: "views/gettingStartedView.hbs"
		}
		
	},{
		
		init : function(){
			//
		},
		
		"#submit-btn click": function(evt) {
			//asi.Router.route("/submit", {});
		}
	

	});

	return GettingStartedController;
 
});


