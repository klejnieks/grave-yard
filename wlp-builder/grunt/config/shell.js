module.exports = {
	"options": {
		failOnError: true,
		stdout: false,
		stderr: true,
		execOptions: {
			maxBuffer: Infinity
		}
	},
	"create-dist": {
		command: ['mkdir <%= grunt.config.data.distPath %>'].join('&&')
	},
	"create-cordova-project": {
		command: ['cd <%= grunt.config.data.distPath %> ',
		          'cordova create <%= grunt.config.data.wlpid %> <%= grunt.config.data.ns %> <%= grunt.config.data.wlpname %> ',
		          'cd <%= grunt.config.data.buildPath %> ',
		          'cordova platform add ios',
		          'cordova platform add android'].join('&&')
	},
	"prepare-cordova-project": {
		command: ['cd <%= grunt.config.data.buildPath %>', 'cordova prepare'].join('&&')
	},
	"add-plugins": {
		command: ['cd <%= grunt.config.data.buildPath %>', 
			'cordova plugin add cordova-plugin-whitelist', 
			'cordova plugin add cordova-plugin-splashscreen',
			'cordova plugin add com.ionic.keyboard', 
			'cordova plugin add cordova-plugin-statusbar', 
			//'cordova plugin add https://github.com/AppsFlyerSDK/PhoneGap.git', 
			'cordova plugin add cordova-plugin-device',
			'cordova plugin add cordova-plugin-file'].join('&&')
	},
	"remove-plugins": {
		command: ['cd <%= grunt.config.data.buildPath %>', 'cordova plugin rm cordova-plugin-splashscreen'].join('&&')
	},
	"build": {
		command: ['cd <%= grunt.config.data.buildPath %>', 'cordova build  --device'].join('&&') //--release
	},
	"emulate": {
		command: ['cd <%= grunt.config.data.buildPath %>', 'cordova run --emulate'].join('&&')
	},
	"run": {
		command: ['cd <%= grunt.config.data.buildPath %>', 'cordova run --device'].join('&&')
	},
	"compile-ios": {
		command: ['security unlock-keychain -p M@verick1', 
			//'security find-certificate -a -m -c "iPhone Developer: Kenneth Lejnieks (JQW26G33PW)"',
			//'security add-certificate ' + signingKeysPath + partnerIOSCertificate, 
			//'security add-trusted-cert ' + signingKeysPath + partnerIOSCertificate, 
			'/usr/bin/xcrun -sdk iphoneos PackageApplication -v "<%= grunt.config.data.buildPath %>/platforms/ios/build/device/<%= grunt.config.data.wlpname %>.app" -o "<%= grunt.config.data.buildPath %>/platforms/ios/build/device/<%= grunt.config.data.wlpname %>.ipa" --embed "<%= grunt.config.data.signingKeysPath %><%= grunt.config.data.provisionFile %>" --sign "<%= grunt.config.data.iosSigningCommonName %>" CODE_SIGN_RESOURCE_RULES_PATH=$(SDKROOT)/ResourceRules.plist'].join('&&')
	}
};