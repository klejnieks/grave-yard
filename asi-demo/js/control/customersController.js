define(['jquery','can', 'js/model/applicationModel', 'js/model/customersModel'], function($, can, applicationModel, customersModel) {

	var customersController = can.Control({
		
		defaults: {
			view: "views/customersView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.render();
			
			//customersModel.getCustomers();
			
			/*
			can.when( can.ajax('http://10.29.120.65:9090/CustomerDemo/assets/data/customers.json') )
			.then(function(data) {
				customersModel.attr("customers", new can.List(data.customers));
			});
			*/
			
		},
		
		render: function() {
			var self = this;
			self.element.html(can.view(self.options.view));
			
			require(["js/control/asiHypermediaService"], function(cntrl, el) {
				new cntrl("#customers-list-container");
			}); 

			require(["js/control/customerViewController"], function(cntrl, el) {
				new cntrl("#customer-view-container");
			}); 
			
		},
		
		destroy: function() {
			can.Control.prototype.destroy.call(this);
		}

	});
	
	return customersController;
 
});


