define(['jquery', 'asi'], function($, asi) {

	var ContactCardComponent = asi.Component.extend({
		tag: "contact-card",
  		template: "<h1><content/></h1>",
		scope : {
			visible : false,
			message : "Hello There!"
		},
		events : {
			click : function() {
				this.scope.attr("visible", !this.scope.attr("visible"));
			}
		}
	});

	return ContactCardComponent;

});

