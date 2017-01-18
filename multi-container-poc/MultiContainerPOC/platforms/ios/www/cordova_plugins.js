cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cl.kunder.webview/www/webViewPlugin.js",
        "id": "cl.kunder.webview.webview",
        "merges": [
            "webview"
        ]
    },
    {
        "file": "plugins/com.telerik.plugins.wkwebview/www/wkwebview.js",
        "id": "com.telerik.plugins.wkwebview.wkwebview",
        "clobbers": [
            "wkwebview"
        ]
    },
    {
        "file": "plugins/com.telerik.plugins.nativepagetransitions/www/NativePageTransitions.js",
        "id": "com.telerik.plugins.nativepagetransitions.NativePageTransitions",
        "clobbers": [
            "window.plugins.nativepagetransitions"
        ]
    },
    {
        "file": "plugins/nl.x-services.plugins.touchid/www/TouchID.js",
        "id": "nl.x-services.plugins.touchid.TouchID",
        "clobbers": [
            "window.plugins.touchid"
        ]
    },
    {
        "file": "plugins/com.feedhenry.plugins.webview/www/ios/Webview.js",
        "id": "com.feedhenry.plugins.webview.Webview",
        "clobbers": [
            "Webview"
        ]
    },
    {
        "file": "plugins/com.drivewealth.webcontainer/www/webContainerPlugin.js",
        "id": "com.drivewealth.webcontainer.webContainer",
        "merges": [
            "webcontainer"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cl.kunder.webview": "1.0.0",
    "com.telerik.plugins.wkwebview": "0.5.0",
    "com.telerik.plugins.nativepagetransitions": "0.4.1",
    "nl.x-services.plugins.touchid": "2.0.0",
    "com.feedhenry.plugins.webview": "0.0.1",
    "com.drivewealth.webcontainer": "1.0.3",
    "cordova-plugin-webserver": "1.0.3"
}
// BOTTOM OF METADATA
});