define(['jquery','can', 'js/model/customersModel'], function($, can, customersModel) {


	ASI.Service = can.Something.extend({
		self: function() {
			can.when( can.ajax(url) ).then(callback);
		},
		
		addService: function(rel, href, callback, scope) {
			this[ref] = function() {
				can.when( can.ajax(href) )
				.then(callback.call(scope));
			};
		}
		
	},{});
	

	var customersListService = ASI.Service({
		
		defaults: {
			url: "something.com",
			callback: function(data) {
				//
			}
		}
		
		//nb:
		//This would be the base api call. Each HyperMedia service will expect 
		//to have AT LEAST this endpoint
		//Calling "view" will gather all of the rel links for the subsequent calls
		
		
		/*
		accounts: function() {
			can.when( can.ajax('http://10.29.120.65:9090/CustomerDemo/assets/data/customers.json') )
			.then(function(data) {
				customersModel.attr("customers", new can.List(data.customers));
			});
		},
		
		create: function() {
			//
		},
		
		del: function(eci) {
			//
		},
		
		update: function(eci) {
			//
		},
		*/
		
		
		
	},{});
	
	return customersListService;
 
});


