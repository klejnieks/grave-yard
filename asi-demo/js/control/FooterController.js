define(function(require) {

	var asi = require("asi");
	
	var FooterController = asi.Control({
		
		defaults: {
			view: "views/footerView.hbs"
		}
		
	},{
		
		init : function(){
			//
		},
		
		"#submit-btn click": function(evt) {
			//asi.Router.route("/submit", {});
		}
	
	});

	return FooterController;
 
});


