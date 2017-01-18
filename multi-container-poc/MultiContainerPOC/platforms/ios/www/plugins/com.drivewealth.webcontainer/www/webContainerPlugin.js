cordova.define("com.drivewealth.webcontainer.webContainer", function(require, exports, module) { module.exports = (function() {
	'use strict';
	
	//PORTFOLIO
	var _addPortfolio = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'addPortfolio', [url]);
	};
	
	var _hidePortfolio = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'hidePortfolio', []);
	};
	
	var _showPortfolio = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'showPortfolio', [url]);
	};
	
	var _removePortfolio = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'removePortfolio', []);
	};
	
	//INSTRUMENT CARD
	var _addInstrumentCard = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'addInstrumentCard', [url]);
	};
	
	var _hideInstrumentCard = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'hideInstrumentCard', []);
	};
	
	var _showInstrumentCard = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'showInstrumentCard', [url]);
	};
	
	var _removeInstrumentCard = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'removeInstrumentCard', []);
	};

	//GENERIC
	var _add = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'add', [url]);
	};

	var _add2 = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'add2', [url]);
	};
  
	var _remove = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'remove', []);
	};

	var _show = function(url, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'show', [url]);
	};

	var _hide = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'hide', []);
	};

	var _test = function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, 'WebContainerPlugin', 'test', []);
	};

	return {
		AddPortfolio: _addPortfolio,
		HidePortfolio: _hidePortfolio,
		ShowPortfolio: _showPortfolio,
		RemovePortfolio: _removePortfolio,
		AddInstrumentCard: _addInstrumentCard,
		HideInstrumentCard: _hideInstrumentCard,
		ShowInstrumentCard: _showInstrumentCard,
		RemoveInstrumentCard: _removeInstrumentCard,
		Add: _add,
		Add2: _add2,
		Remove: _remove,
		Show: _show,
		Hide: _hide,
		Close: _hide,
		Test: _test
	};

})();

});
