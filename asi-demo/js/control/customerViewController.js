define(['jquery','can', 'js/model/applicationModel', 'js/model/customersModel'], function($, can, applicationModel, customersModel) {

	var customerViewController = can.Control({
		
		defaults: {
			view: "views/customerView.hbs"
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
			self.element.html(can.view(self.options.view, {
				customer: can.compute(function() {
					return customersModel.attr("activeCustomer");
				})
			}));
			
		},
		
		".customer-list li click": function(obj, evt) {
			debugger;
		},
		
		destroy: function() {
			can.Control.prototype.destroy.call(this);
		}

	});
	
	return customerViewController;
 
});


