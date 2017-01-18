define(['lib/asi/asi', 'lib/page/page'], function(asi, page) {

	var Router = asi.Router = asi.Construct.extend({
			
			config: undefined,
			location: window.history.location || window.location, 
			
			CNTLR_SUFFIX: "Controller",
			
			/*
			setup: function() {
				can.Construct.setup.apply(this, arguments);
				debugger;
			}
			*/
			
		},{
		/*
			setup: function() {
				//asi.Construct.setup.apply(this, arguments);
				console.log("router setup");
				
				
				debugger;
				
				// TO-DO addEvent to listen when controler triggers route_change event)
				//asi.addEvent(asi.Event.ROUTE_CHANGE, self.routeChangeHandler);
				//self = this;
				
				//this.route.apply(this, arguments);
			},
			*/
		//initialize
		init: function(config) {
			// TO-DO addEvent to listen when controler triggers route_change event)
			//asi.addEvent(asi.Event.ROUTE_CHANGE, self.routeChangeHandler);
			//self = this;
			console.log("router init");
			debugger;
			this.constructor.config = config;

			page(this.routeCallback.call(this));
			//page();
		},

		routeCallback: function(context, next) {
			
			this.loadController("js/control/applicationController");
			
			return;
			
			var basePath = this.constructor.config.basePath;

			if (!basePath) {
				basePath ="/";
			}

			// If there is a basepath ex: contextPath. Get the url after the base path.
			var url = context.canonicalPath;
			url = url.substr(url.indexOf(basePath) + basePath.length);

			// Split the url on "/" and get the primary controllerName based on the primary path
			// and pass the rest of the path to the controller.. 
			var urlFragments = url.split("/");

			// Example primary path /basePath/test/test1/test2/test3 [test is primary]
			// test/test1/test2/test3 [evertyhing beyond test is secondary]
			var primaryPath = urlFragments[0], 
				secondaryPath = urlFragments.slice(1).join('/'),
				controllerName = null;

			if (primaryPath) {

				// Check if the config exist. If exist get the route from config based on primarypath. 
				// Get the controllername else build the controllername from the primary path.
				var route = config ? config.map[primaryPath] : null;

				if (route) {
					controllerName = route.controller;
				}
				else {
					controllerName = primaryPath + CNTLR_SUFFIX;
				}
			}
			else {
				var defaultRoute = config ? config.defaultRoute : null ;

				if (defaultRoute) {
					controllerName = defaultRoute + CNTLR_SUFFIX;
				}
			}

			if (controllerName) {
				self.loadController(controllerName, secondaryPath)
			}
			else {
				throw new Error(" No controller available!. Please check your configuration.");
			}

			next();
			page.stop();
		},

		// Listen for asi.Event(asi.EVENTS.ROUTE_CHANGE);
		routeChangeHandler: function(data) {
			// TO-DO handle ROUTE_CHANGE event from controller to update the route.
		},

		loadController: function(controllerName, data) {
			var pathPrefix = "./";
			
			if (controllerName.indexOf("/") == 0) {
				pathPrefix = ".";
			}
			debugger;
			require([pathPrefix + controllerName + ".js"], function(Controller) {

				new Controller(data);
			}, function(err) {
				throw new Error("controller: " + controllerName + "does not exist");
			});
		}

	});

	return Router;
});
