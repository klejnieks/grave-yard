define(function(require) {

	var asi = require("asi"),
		HeaderController = require("js/control/HeaderController"),
		NavigationController = require("js/control/NavigationController"),
		GettingStartedController = require("js/control/GettingStartedController"),
		FooterController = require("js/control/FooterController");
	
	var ApplicationController = asi.Control({
		
		defaults: {
			//
		}
		
	},{
		
		init : function(){
			debugger;
			//hyperMediaService.ping("Ken Lejnieks");
			//hyperMediaService.self();
			
			//this.loadView("customers");
			
			/*
			require(["js/control/asiHypermediaService"], function(cntrl) {
				debugger;
				cntrl.echo(); 
			}, function(err) {
				alert("controller: " + controller + "Controller does not exist");
			});
			*/
			
			//this.testGet();
			var self = this;
			
			/*
			asi.addEvent(asi.Event.UPDATE_COMPLETE, function(evt) {
				var view = evt.data.path.replace("#!/","");
				//view = asi.toTitleCase(view);
				self.loadView(view, "#main-content")
			});
			*/
			
			new HeaderController(".application-header");
			new NavigationController(".application-nav");
			new GettingStartedController("#main-content");
			new FooterController(".application-footer");
			
			//asi.loadController(".application-header", "Header");
			//asi.loadController(".application-nav", "Navigation");
			//asi.loadController("#main-content", "GettingStarted");
			//asi.loadController(".application-footer", "Footer");
		},
		
		updateView: function(evt) {
			var view = evt.data.path.replace("#!/","");
			var self = this;
			self.loadContent(view)
		},
		
		"#submit-btn click": function(evt) {
			//asi.Router.route("/submit", {});
		}
	

	});

	return ApplicationController;
 
});


