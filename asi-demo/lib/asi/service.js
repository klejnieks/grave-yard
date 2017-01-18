define(['jquery','lib/asi/asi'], function($, asi) {


	var service = asi.Service = asi.Construct.extend({
		
		constructorExtends: false,
		url: null,
		serviceProperty: 'TestVariable'
		
	},{
		
		init: function(url) {
			if(asi.notNullOrUndefined(url)) {
				this.url = url;
			}
		},
		
		setUrl: function(_url) {
			this.url = _url;
		},
		
		getUrl: function() {
			return this.url;
		},
		
		get: function(_url, _success, _error, _callback) {
			var url = _url || this.url;
			$.ajax(url).then(_success, _error).then(_callback);
		},
		
		post: function(_url, _data, _success, _error, _callback) {
			//
		},
		
		poll: function(url, success, error, callback) {
			var timer;
			
			(function process() {
				console.log("waiting...");
				var deferred = $.Deferred();
     
				timer = setInterval( function() {
					deferred.notify();
				}, 1000);
   
				setTimeout( function() {
					clearInterval(timer);
					deferred.resolve();
				}, 10000);
   
				return deferred.promise();
			})()
			.then(doneHandler, errorHandler, progressHandler);
		},
		
		ping: function(msg) {
			alert("ping with message: " + msg);
		}
		
	});

	return service;
 
});


