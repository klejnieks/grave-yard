define(['jquery','lib/asi/asi'], function($, asi) {


	var hypermedia = asi.Hypermedia = asi.Service.extend({
		
		internalVariable: "someValue"
	
	},{
		autoBuildRels: true,
		services: {},
		
		self: function(_success, _error, _callback) {
			var self = this;
			$.ajax(this.url).then(function(data, status, obj) {
				if(self.autoBuildRels) {
					self.addService();
					_success();
				}
			}, _error).then(_callback);
		},
		
		addService: function(rel, href, callback, scope) {
			
			asi.log("adding services");
			
			for(var i = 0; i<10; i++) {
				this.services["service" + i] = function() {
					asi.log("service" + i + " was called");
				};
			}
			
			debugger;
			
			/*
			this[ref] = function() {
				$.ajax(href).then(callback.call(scope));
			};
			*/
		}
		
	});
	

	return hypermedia;
 
});


