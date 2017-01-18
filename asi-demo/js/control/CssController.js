define(['jquery','asi'], function($, asi) {

	var CssController = asi.Control({
		
		defaults: {
			view: "views/cssView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.element.html(asi.view(self.options.view));
		},
		
		"#submit-btn click": function(evt) {
			//asi.Router.route("/submit", {});
		}
	

	});

	return CssController;
 
});


