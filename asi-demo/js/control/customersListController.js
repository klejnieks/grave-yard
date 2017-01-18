define(['jquery','can', 'js/model/applicationModel', 'js/model/customersModel', 'js/control/customersListService'], function($, can, applicationModel, customersModel, customersListService) {

	var customersListController = can.Control({
		
		defaults: {
			view: "views/customersListView.hbs"
		}
		
	},{
		
		init : function(){
			var self = this;
			self.render();

			customersListService.self();
			
			
			//nb
			//Sample code
			var services = customersListService.self();
			services.then(function(data){
				//data is the complete set of initial data including links
				
				//Try a filter instead of a loop
				//data.filter("accounts")
				
				foreach(var account in data) {
					foreach(var link in account) {
						customersListService.addService(link.rel, link.href, function(data) {
							customersModel.attr("customers", new can.List(data.customers));
						}, this);
					}
				}
				
			});
			
			
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
				customers: can.compute(function() {
					return customersModel.attr("customers");
				})
			}));
			
		},
		
		".customer-list li click": function(el, evt) {
			customersModel.setSelectedCustomer($(el).data("eci"));
		},
		
		destroy: function() {
			can.Control.prototype.destroy.call(this);
		}

	});
	
	return customersListController;
 
});


