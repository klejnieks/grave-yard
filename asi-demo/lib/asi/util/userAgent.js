function getUserAgent() {
	var ua = navigator.userAgent.toLowerCase();
	var makeVersion = function(result)
	{
		return parseInt(result[1]) * 1000 + parseInt(result[2]);
	};
	
	if (ua.indexOf('opera') != -1)
	{
		return 'opera';
	}
	
	if (ua.indexOf('webkit') != -1)
	{
		return 'safari';
	}
	
	if (ua.indexOf('msie') != -1)
	{
		var docMode = document.documentMode;
		if (docMode >= 8)
		{
			// ie8, ie9, ie10
			return "ie" + docMode;
		}
	}
			
	var ieVersion = 5000;
	var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
	if (result && result.length == 3)
	{
		ieVersion = makeVersion(result);
	}
		
	if (ieVersion >= 6000)
	{
		return 'ie6';
	}
	
	if (ua.indexOf('gecko') != -1)
	{
		return 'gecko1_8';
	}
	
	return 'unknown';
};