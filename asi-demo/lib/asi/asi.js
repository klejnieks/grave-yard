/*!
 * ASI
 * http://jpmorgan.com/
 * Copyright (c) 2014 jpmorgan
 * 
 */
define(['can'], function (can) {

	var asi = window.asi || {};
	if (typeof ASI === 'undefined' || ASI !== false) {
		window.asi = asi = window.can;
	}

	// An empty function useful for where you need a dummy callback.
	asi.k = function(){};

	asi.VERSION = '0.0.9';
	
	return asi;
});