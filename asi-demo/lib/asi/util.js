/*!
 * ASI
 * http://jpmorgan.com/
 * Copyright (c) 2014 jpmorgan
 * 
 */
define(['lib/asi/asi'], function (asi) {

	asi.extend(asi, {
		
		notNullOrUndefined: function(obj, testEmptyString) {
			if(obj === 'undefined' || typeof obj === 'undefined' || obj === null) {
				if(testEmptyString) {
					return (obj !== '');
				}
				return false;
			}
			return true;
		},
		
		isDefined: function(arg) {
			try {
				var u = undefined;
				if (u === arg) {
					return false;
				}	
				return true;
			}
			catch (e)
			{
				// This code should never be hit. Added this as a super cautious safety net for an unexpected usecase.
				return (typeof arg != "undefined");
			}
		},

		toTitleCase: function(str) {
		    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},
		
		callLater: function(f, scope) {
			/*setTimeout($.proxy(function() {
				scope[f]();
			}, scope), 1);*/
		},
		
		log: function(msg) {
			if(window.console) {
				console.log(msg);
			}
		},
		
		guid: function() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		},
		
		loadController: function(el, controller) {
			require(["js/control/" + controller + "Controller"], function(cntrl) {
				new cntrl(el);
			}, function(err) {
				throw new Error("controller: " + controller + "Controller does not exist. " + err);
			});
		},
		
		removeJS: function(filename){
			var scripts = document.getElementsByTagName('script');
			for(var i = scripts.length; i >= 0; i--) { 
				if(scripts[i] && scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').indexOf(filename) != -1)
					scripts[i].parentNode.removeChild(scripts[i]); 
			}
		
			requirejs.undef(filename.replace(".js", ""));
		}
		
	});
	
	return asi;
});