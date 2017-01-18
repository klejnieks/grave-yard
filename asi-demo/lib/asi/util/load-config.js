define(function() {
	var LoadConfig = {
		app: null,
		applegacy: false
	};

	var appscripts = document.getElementsByTagName("script");
	var appscriptsLength = appscripts.length;
	for (var i = 0; i < appscriptsLength; i++)
	{
		var script = appscripts[i];

		var app = script.getAttribute('app');
		if (app)
		{
			LoadConfig.app = app;
			LoadConfig.applegacy = (script.getAttribute('app-legacy') != null) ? true : false;

			break;
		}
	}

	return LoadConfig;
});