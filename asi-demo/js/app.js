require.config({

	baseUrl : '.',
	
	paths: {
   		'asi': 'lib/asi'
	}
});

require(['js/router/applicationRouter'], function(applicationRouter){
	new applicationRouter();
});