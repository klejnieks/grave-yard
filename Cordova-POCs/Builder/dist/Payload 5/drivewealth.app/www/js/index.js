document.addEventListener('deviceready', this.onDeviceReady, false);

onDeviceReady: function() {
	alert("onDeviceReady " + this);
	
	var args = [], devKey = "fLXfJvJmGkim8kpv2fKg4D";
	args.push(devKey);

	if (device.platform === "iOS") {
		var appId = "906893868";
		args.push(appId);
	}
	window.plugins.appsFlyer.initSdk(args);
	
	setTimeout(function() {
		alert("remove splash");
		document.getElementById("splash").className += " hidden";
	}, 3000);
	
};    
