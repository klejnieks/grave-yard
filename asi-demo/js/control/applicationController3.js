define(['jquery','eventManager', 'js/control/ContactCardComponent', 'js/model/applicationModel', 'asi'], function($, eventManager, ContactCardComponent, applicationModel, asi) {
	
	var applicationController3 = can.Control({
		
		defaults: {
			view: "views/homeView.hbs"
		}
		
	},{
		
		init : function(){
			debugger;
			applicationModel.attr("firstname", "*****************************");
			applicationModel.attr("lastname", "+++++++++++++++++++++++++++++++");
			var self = this;
			self.element.html(can.view(self.options.view, {
				modelFirstName: can.compute(function(){
					return applicationModel.attr("firstname");
				}),
				lastName: can.compute(function(){
					return applicationModel.attr("lastname");
				})
			}));
			
			setTimeout(this.delayedLoadCntrl, 2000);
			
		},
		
		delayedLoadCntrl: function() {
			require(["js/control/subViewController"], function(cntrl, el) {
				new cntrl("#sub-view-container"); 
			}, function(err) {
				alert("controller: " + controller + "Controller does not exist");
			});
		}
		
		
	});
	
	return applicationController3;
 
});


