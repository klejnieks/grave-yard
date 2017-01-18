cordova.define("cl.kunder.webview.webview", function(require, exports, module) { /*global elu, module */
module.exports = (function() {
  'use strict';


  var _add = function(url, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'WebViewPlugin', 'add', [url]);
  };

  var _remove = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'WebViewPlugin', 'remove', []);
  };

	var _show = function(url, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'WebViewPlugin', 'show', [url]);
  };

  var _hide = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'WebViewPlugin', 'hide', []);
  };


  return {
    Add: _add,
    Remove: _remove,
    Show: _show,
    Hide: _hide,
    Close: _hide
  };

})();

});
