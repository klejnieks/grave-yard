define(['jquery','eventManager', 'js/control/ContactCardComponent', 'js/model/applicationModel', 'asi'], function($, eventManager, ContactCardComponent, applicationModel, asi) {
	
	var topSectionController = can.Control({
		
		defaults: {
			view: "views/topSectionView.hbs"
		}
		
	},{
		
		init : function(){
			
			var self = this;
			self.element.html(can.view(self.options.view));
			
			asi.addEvent(asi.Event.UPDATE_COMPLETE, self.handler);
			
			if (window.addEventListener != null) { 
				document.addEventListener('CustomEvent', self.customEventHandler);
			}
			else if (window.attachEvent != null) { 
				document.attachEvent('CustomEvent', self.customEventHandler);
			}
		},
		
		handler: function(obj) {
			$(".top-container").append("Event Handler results: " + obj.data.msg + "<br />");
		},
		
		customEventHandler: function(e) {
			$(".top-container").append("Custom Event Handler results: " + e.detail + "<br />");
		}
		
	});
	
	return topSectionController;
 
});


