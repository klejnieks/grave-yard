

require.config({
	version: '0.1.1',
	paths: {
		'jquery': 'lib/jquery',
		'can': 'lib/can'
	},
	shim: {
		'can': {
			exports: 'can',
			deps: [ 'jquery' ]
		}
	}
});

define(["jquery", "can"], function($, can) {
	
	var ASI = window.ASI = can || {};
	ASI.dsl = {};
	ASI.dsl.version = "1.2.0";
	
	return ASI;
});
