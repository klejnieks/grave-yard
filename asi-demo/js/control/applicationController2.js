define(['jquery','eventManager', 'js/control/ContactCardComponent', 'js/model/applicationModel', 'asi'], function($, eventManager, ContactCardComponent, applicationModel, asi) {
	
	var applicationController = can.Control({
		
		defaults: {
			view: "views/applicationView.hbs"
		}
		
	},{
		
		init : function(){
			
			var self = this;
			self.element.html(can.view(self.options.view));
			
			
			//asi.addEvent(asi.Event.UPDATE_COMPLETE, this.searchAndDestroyCanEvent2);
			setTimeout(self.loadViews, 1000);
		},
		
		loadViews: function() {
			require(["js/control/topSectionController"], function(topSectionCntrl) {
				new topSectionCntrl("#top-section-container"); 
			}, function(err) {
				alert("controllers did not load correctly: " + err);
			});

			require(["js/control/bottomSectionController"], function(bottomSectionCntrl) {
				new bottomSectionCntrl("#bottom-section-container"); 
			}, function(err) {
				alert("controllers did not load correctly: " + err);
			});
		},
		
		resetMainView: function() {
			debugger;
			console.log("remove event");
			asi.dispatch("customEvent");
			asi.removeEvent(asi.Event.UPDATE_COMPLETE, this.searchAndDestroyCanEvent2);
			require(["js/control/applicationController3"], function(cntrl, el) {
				new cntrl("#main-content"); 
			}, function(err) {
				alert("controller: Controller does not exist");
			});
		},
		
		dispatchEventsTest: function() {
			console.log("dispatch events test called");
			
			//eventManager.dispatch("searchAndDestroyEventBus", obj, {});
			
			var customEvent = new asi.Event(asi.Event.UPDATE_COMPLETE, {name:"klejnieks"});
			asi.dispatch(customEvent);
		},
		
		searchAndDestroyCanEvent2: function(obj) {
			console.log("search and destory");
			var myName = obj.data.name;
		},
		
		destroy: function(){
			
			debugger;
			can.Control.prototype.destroy.call(this);
		}
		
	});
	
	return applicationController;
 
});


