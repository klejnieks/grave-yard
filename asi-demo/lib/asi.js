/*!
 * ASI
 * http://jpmorgan.com/
 * Copyright (c) 2014 jpmorgan
 * 
 */
require.config({
	paths: {
		'jquery': 'lib/jquery/jquery.src',
		'can': 'lib/can/can'
	}//,
	/*
	shim: {
		'can': {
			exports: 'can',
			deps: [ 'jquery' ]
		}
	}
	*/
});

define(["jquery", "lib/asi/asi", "lib/asi/control","lib/asi/router", "lib/asi/event", "lib/asi/util"], function($, asi) {
	return asi;
});

 
