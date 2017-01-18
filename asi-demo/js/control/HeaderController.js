define(function(require) {

	var asi = require("asi");
	
	var HeaderController = asi.Control({
		
		defaults: {
			view: "views/headerView.hbs"
		}
		
	},{
		
		init : function(){
		},
		
		"#submit-btn click": function(evt) {
			//asi.Router.route("/submit", {});
		}
	

	});

	return HeaderController;
 
});


