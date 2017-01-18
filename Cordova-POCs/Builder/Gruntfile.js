/*global module:false*/
module.exports = function(grunt) {

	var pathToPartners = '../../../partners/',
		appName = 'drivewealth',
		ns = 'com.noroso.' + appName,
		css = pathToPartners + appName + '/css/',
		js = pathToPartners + appName + '/js/',
		images = pathToPartners + appName + '/img/',
		icons = pathToPartners + appName + '/icons/ios/',
		index = pathToPartners + appName + '/',
		platform = 'ios',
		signingKeysPath = 'assets/Keys/DriveWealth/iOS/',
		partnerIOSCertificate = 'iPhone_Developer_Kenneth_Lejnieks_JQW26G33PW.cer',
		iosSigningCommonName = 'iPhone Developer: Kenneth Lejnieks (JQW26G33PW)', //'iPhone Distribution: Kenneth Lejnieks (J8M8UJ9ED4)',
		provisionFile = 'DriveWealth_adhoc_using_noroso.mobileprovision',
		isRelease = false
		svgImg_avatar = '<svg width="225" height="120" viewBox="0 0 826 212" xmlns="http://www.w3.org/2000/svg"><title>Avatar Capital Group, LLC</title><g fill="none"><path d="M116.238 186.801c0-14.628 10.776-24.612 24.482-24.612 8.417 0 14.264 3.989 18.054 9.418l-4.925 2.771c-2.713-4.063-7.709-6.912-13.129-6.912-10.425 0-18.341 7.923-18.341 19.335 0 11.273 7.916 19.346 18.341 19.346 5.42 0 10.416-2.929 13.129-6.92l4.995 2.705c-3.997 5.501-9.707 9.491-18.124 9.491-13.706 0-24.482-9.993-24.482-24.622" fill="#1A1919"/><path d="M187.395 169.032l-10.061 25.695h20.19l-10.129-25.695zm16.064 41.535l-4.211-10.631h-23.695l-4.212 10.631h-6.778l19.198-47.599h7.348l19.128 47.599h-6.778z" fill="#1A1919"/><path d="M247.669 177.317c0-5.359-3.848-9.067-9.485-9.067h-12.488v18.134h12.488c5.637 0 9.485-3.725 9.485-9.067m-27.893 33.25v-47.599h19.114c9.566 0 14.92 6.561 14.92 14.349 0 7.779-5.423 14.336-14.92 14.336h-13.194v18.914h-5.92" fill="#1A1919"/><path d="M264.668 162.968h5.928v47.599h-5.928v-47.599z" fill="#1A1919"/><path d="M295.858 210.567v-42.317h-15.052v-5.289h36.107v5.289h-15.129v42.317h-5.926" fill="#1A1919"/><path d="M339.108 169.032l-10.063 25.705h20.192l-10.129-25.705zm16.051 41.535l-4.212-10.631h-23.687l-4.204 10.631h-6.785l19.196-47.599h7.35l19.128 47.599h-6.786z" fill="#1A1919"/><path d="M371.697 210.567v-47.606h5.92v42.328h22.124v5.278h-28.044" fill="#1A1919"/><path d="M427.82 186.801c0-14.843 10.914-24.612 24.48-24.612 8.491 0 14.343 3.712 18.482 8.849l-4.713 2.991c-2.998-3.846-8.062-6.563-13.769-6.563-10.423 0-18.346 7.923-18.346 19.335 0 11.273 7.923 19.346 18.346 19.346 5.707 0 10.418-2.709 12.844-5.132v-9.634h-16.412v-5.288h22.267v17.125c-4.434 4.997-10.919 8.275-18.699 8.275-13.566 0-24.48-9.914-24.48-24.692" fill="#1A1919"/><path d="M511.64 177.317c0-5.427-3.923-9.067-9.564-9.067h-12.494v18.201h12.494c5.641 0 9.564-3.792 9.564-9.134m-.436 33.25l-12.055-18.914h-9.567v18.914h-5.924v-47.599h19.131c8.703 0 14.988 5.566 14.988 14.349 0 8.555-5.923 13.272-12.421 13.843l12.85 19.407h-7.002" fill="#1A1919"/><path d="M569.285 186.801c0-11.125-6.935-19.335-17.558-19.335-10.706 0-17.493 8.21-17.493 19.335 0 11.073 6.787 19.346 17.493 19.346 10.623 0 17.558-8.273 17.558-19.346m-41.183 0c0-14.062 9.56-24.612 23.625-24.612 14.049 0 23.693 10.55 23.693 24.612 0 14.064-9.644 24.622-23.693 24.622-14.065 0-23.625-10.558-23.625-24.622" fill="#1A1919"/><path d="M587.328 192.088v-29.12h6v28.976c0 8.712 4.636 14.203 13.413 14.203 8.776 0 13.488-5.491 13.488-14.203v-28.976h6v29.053c0 11.839-6.575 19.402-19.488 19.402-12.845 0-19.413-7.622-19.413-19.335" fill="#1A1919"/><path d="M669.189 177.317c0-5.359-3.861-9.067-9.498-9.067h-12.49v18.134h12.49c5.637 0 9.498-3.725 9.498-9.067m-27.914 33.25v-47.599h19.135c9.558 0 14.915 6.561 14.915 14.349 0 7.779-5.422 14.336-14.915 14.336h-13.209v18.914h-5.926" fill="#1A1919"/><path d="M709.756 210.567v-47.606h5.925v42.328h22.116v5.278h-28.041" fill="#1A1919"/><path d="M748.92 210.567v-47.606h5.923v42.328h22.121v5.278h-28.044" fill="#1A1919"/><path d="M782.83 186.801c0-14.628 10.776-24.612 24.477-24.612 8.43 0 14.271 3.989 18.059 9.418l-4.925 2.771c-2.712-4.063-7.713-6.912-13.134-6.912-10.412 0-18.341 7.923-18.341 19.335 0 11.273 7.929 19.346 18.341 19.346 5.421 0 10.422-2.929 13.134-6.92l4.996 2.705c-4.001 5.501-9.7 9.491-18.13 9.491-13.701 0-24.477-9.993-24.477-24.622" fill="#1A1919"/><path d="M186.27 29.258l-21.057 58.103h42.117l-21.06-58.103zm37.459 106.293l-8.508-22.884h-57.895l-8.509 22.884h-32.598l52.029-135.044h36.044l52.032 135.044h-32.595z" fill="#1A1919"/><path d="M282.689 135.551l-52.033-135.044h32.597l37.46 103.671 37.456-103.671h32.6l-52.029 135.044h-36.051" fill="#1A1919"/><path d="M509.672 135.551v-109.737h-39.478v-25.307h107.713v25.307h-39.275v109.737h-28.96" fill="#1A1919"/><path d="M633.162 29.258l-21.058 58.103h42.113l-21.055-58.103zm37.459 106.293l-8.51-22.884h-57.904l-8.505 22.884h-32.59l52.027-135.044h36.045l52.034 135.044h-32.597z" fill="#1A1919"/><path d="M795.239 43.833c0-11.137-8.709-18.019-20.055-18.019h-30.364v36.444h30.364c11.346 0 20.055-6.881 20.055-18.425m-2.841 91.718l-26.521-47.988h-21.057v47.988h-28.749v-135.044h63.169c28.147 0 45.562 18.417 45.562 43.528 0 23.687-15.185 36.649-29.773 40.089l30.578 51.427h-33.209" fill="#1A1919"/><path d="M485.374 135.551l-52.051-135.044h-36.031l-52.039 135.044h32.597l37.462-106.293 20.481 58.13h-13.755l-7.886 25.326h30.572l8.044 22.837h32.606" fill="#DA322F"/><path d="M150.116.507h-39.706l-57.093 135.044h39.716l57.083-135.044" fill="#DA322F"/><path d="M76.167 49.968h-39.699l-36.075 85.583h39.713l36.061-85.583" fill="#DA322F"/></g></svg>',
		svgImg_drivewealth ='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 357.3 79" enable-background="new 0 0 357.3 79" xml:space="preserve"><style>.logo-glyph{fill:	#FEC109;}.logo-text{fill:	#333333;}</style><g><g><path d="M20.3 64.8c-2.3 0-4.5-1.4-5.3-3.7L4 30.7c-1.1-2.9 0.4-6.2 3.4-7.3c2.9-1.1 6.2 0.4 7.3 3.4l11.1 30.4 c1.1 2.9-0.4 6.2-3.4 7.3C21.6 64.7 21 64.8 20.3 64.8z" class="logo-glyph"/></g><g><path d="M20.3 64.8c-0.6 0-1.3-0.1-1.9-0.3c-2.9-1.1-4.5-4.3-3.4-7.3l14.7-40.5c1.1-2.9 4.3-4.5 7.3-3.4 c2.9 1.1 4.5 4.3 3.4 7.3L25.7 61.1C24.8 63.4 22.6 64.8 20.3 64.8z" class="logo-glyph"/></g><g><path d="M53.5 74.9c-2.3 0-4.5-1.4-5.3-3.7L29.8 20.6c-1.1-2.9 0.4-6.2 3.4-7.3c2.9-1.1 6.2 0.4 7.3 3.4l18.4 50.6 c1.1 2.9-0.4 6.2-3.4 7.3C54.8 74.8 54.2 74.9 53.5 74.9z" class="logo-glyph"/></g><g><path d="M53.5 74.9c-0.6 0-1.3-0.1-1.9-0.3c-2.9-1.1-4.5-4.3-3.4-7.3L70.3 6.6c1.1-2.9 4.3-4.5 7.3-3.4 c2.9 1.1 4.5 4.3 3.4 7.3L58.8 71.2C58 73.5 55.8 74.9 53.5 74.9z" class="logo-glyph"/></g></g><g><path d="M102.8 53.4V25.7c0-1 0.8-1.8 1.8-1.8h7.4c10.8 0 17.2 5.8 17.2 15.6c0 9.9-6.5 15.8-17.4 15.8h-7.2 C103.7 55.2 102.8 54.4 102.8 53.4z M112.1 52.3c8.8 0 13.8-4.7 13.8-12.8c0-8-5.1-12.8-13.8-12.8h-6v25.6H112.1z" class="logo-text"/><path d="M137.8 36.4c1-3.2 3-4.8 6.1-4.8c2.1 0 3.3 0.9 3.3 2.4c0 1.2-0.8 1.7-0.9 1.6c-0.7-0.6-1.5-1-2.8-1 c-4.1 0-5.7 4.3-5.7 10.2v9.1c0 1.2-0.6 1.5-1.4 1.5h-0.3c-0.8 0-1.4-0.3-1.4-1.5V32.3c0-0.1 0.5-0.3 1.1-0.3c1.1 0 2 0.5 2 3.1 V36.4z" class="logo-text"/><path d="M150.9 24.3c0-1.4 0.7-2.1 2.1-2.1c1.4 0 2 0.7 2 2.1c0 1.4-0.7 2.1-2.1 2.1 C151.6 26.4 150.9 25.6 150.9 24.3z M151.3 53.9V33.4c0-1.2 0.6-1.5 1.4-1.5h0.3c0.8 0 1.4 0.3 1.4 1.5v20.5c0 1.2-0.6 1.5-1.4 1.5 h-0.3C151.9 55.4 151.3 55.1 151.3 53.9z" class="logo-text"/><path d="M176.4 34.3c0.7-1.9 1.3-2.3 2.3-2.3c1.1 0 1.6 0.8 1.6 0.9l-8.5 21.4c-0.3 0.8-0.7 1.3-2.3 1.3 c-1.6 0-1.8-0.3-2.1-1.2l-8.6-21.5c0-0.2 0.4-0.9 1.6-0.9c1.1 0 1.6 0.4 2.4 2.3l6.8 18.1L176.4 34.3z" class="logo-text"/><path d="M182.1 43.8c0-7 4.9-12.2 11.6-12.2c6.5 0 10.8 4.6 10.8 11.6v0.3c0 0.9-0.3 1.1-1.3 1.1h-17.9 c0.2 4.9 3.8 8.4 8.8 8.4c4.5 0 6.5-1.9 7.9-4.1c0.1-0.1 1.8 0.3 1.8 1.8c0 1.6-3.5 5.1-9.7 5.1C187 55.8 182.1 50.9 182.1 43.8z M185.4 41.8h15.8c-0.3-4.6-3.1-7.5-7.4-7.5C189.4 34.3 186.1 37.4 185.4 41.8z" class="logo-text"/><path d="M215.9 53.6l-7.3-28.5c0-0.2 1-1.4 3-1.4c1.3 0 2.4 0.8 2.9 2.9l5.1 23.1l6-19.7c0.4-1.5 1.4-2.3 3.3-2.3 c1.9 0 2.8 0.8 3.3 2.3l5.9 19.6l5.2-23c0.4-2 1.4-2.9 2.8-2.9c1.8 0 2.9 1.2 2.8 1.4l-7.2 28.5c-0.3 1.5-1.3 2-3.4 2 c-1.9 0-2.8-0.6-3.2-2l-6.1-20.3l-6.4 20.3c-0.4 1.5-1.2 2-3.2 2C217.1 55.6 216.2 55.1 215.9 53.6z" class="logo-text"/><path d="M250.2 43.7c0-7.1 5-12.4 11.9-12.4c6.7 0 11.2 4.8 11.2 11.7v0.4c0 1-0.3 1.4-1.5 1.4h-17.2 c0.3 4.3 3.5 7.2 8 7.2c4.1 0 6.1-1.8 7.3-3.9c0.1-0.1 2.5 0.3 2.5 2.4c0 2-3.6 5.3-9.9 5.3C255.2 55.8 250.2 50.9 250.2 43.7z M254.8 41.6h14c-0.2-4-2.7-6.6-6.6-6.6C258.3 34.9 255.3 37.7 254.8 41.6z" class="logo-text"/><path d="M276.5 49.1c0-5.4 5.1-7.7 15.7-7.9h0.6v-0.5c0-3.5-2-5.5-5.8-5.5c-3.5 0-5.6 1.8-6.7 4c0 0-3 0-3-2.3 c0-2.2 3.4-5.6 10-5.6c6.6 0 10.2 3.4 10.2 9.3v14.3c0 0.2-0.9 0.5-1.7 0.5c-1.7 0-2.9-0.9-3-3.7c-1.8 2.5-4.9 4-8.4 4 C279.4 55.8 276.5 53.1 276.5 49.1z M292.8 46v-1.8l-1.3 0c-6.8 0.2-10.3 1.5-10.3 4.7c0 2.1 1.6 3.4 4.4 3.4 C289.8 52.3 292.8 49.7 292.8 46z" class="logo-text"/><path d="M303.4 53.1V22.4c0-0.1 0.8-0.5 1.7-0.5c1.5 0 3.1 0.8 3.1 4.1v27.1c0 1.7-0.9 2.3-2.1 2.3h-0.5 C304.3 55.4 303.4 54.9 303.4 53.1z" class="logo-text"/><path d="M312.3 34v-0.3c0-1.2 0.6-1.8 2.1-1.8h1.7v-3.6c0-1.6 0.8-2.3 2.1-2.3h0.5c1.3 0 2.1 0.5 2.1 2.3v3.6h5.3 c1.5 0 2 0.6 2 1.7V34c0 1.2-0.6 1.8-2.1 1.8h-5.3v11.8c0 2.9 0.8 4.3 3.1 4.3c1.5 0 2.6-0.7 3.3-1.6c0.1-0.1 1.4 0.5 1.4 2 c0 1.8-2 3.5-5.4 3.5c-4.8 0-7-2.7-7-7.7V35.8h-1.7C312.9 35.8 312.3 35.2 312.3 34z" class="logo-text"/><path d="M337.2 35.6c1.6-2.5 4.1-4.3 7.7-4.3c6.2 0 9 4.3 9 10.1v11.7c0 1.7-0.9 2.3-2.1 2.3h-0.5 c-1.3 0-2.1-0.5-2.1-2.3V41.9c0-4-2-6.4-5.4-6.4c-4 0-6.5 2.6-6.5 6.8v10.8c0 1.7-0.9 2.3-2.1 2.3h-0.5c-1.3 0-2.1-0.5-2.1-2.3 V22.4c0-0.1 0.8-0.5 1.7-0.5c1.5 0 3.1 0.8 3.1 4.1V35.6z" class="logo-text"/></g></svg>';
		
		
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),		
		
		banner: '/* Sample Banner prepended to content source' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> */\n',

		concat: {
			options: {
                banner: '<%= banner %>'
            },
			dist: {
				src: ['www/js/**/*.js'],
				dest: 'www/js/<%= pkg.name %>.concat.js'
			}
		},

		shell: {
			options: {
				failOnError: true,
				stdout: false,
				stderr: true,
				execOptions: {
					maxBuffer: Infinity
				}
			},
			create: {
				command: ['cordova create ' + appName + ' ' + ns + ' ' + appName,
					'cd ' + appName,
					'cordova platform add ' + platform ].join('&&')
			},
			addPlugins: {
				command: ['cd ' + appName, 
					'cordova plugin add cordova-plugin-whitelist', 
					'cordova plugin add cordova-plugin-splashscreen',
					'cordova plugin add com.ionic.keyboard', 
					'cordova plugin add cordova-plugin-statusbar', 
					'cordova plugin add https://github.com/AppsFlyerSDK/PhoneGap.git', 
					'cordova plugin add cordova-plugin-device',
					'cordova plugin add cordova-plugin-file'].join('&&')
			},
			removePlugins: {
				command: ['cd ' + appName, 'cordova plugin rm cordova-plugin-splashscreen'].join('&&')
			},
			build: {
				command: ['cd ' + appName, 'cordova build <%= platform %>  --device'].join('&&') //--release
			},
			prepare: {
				command: ['cd ' + appName, 'cordova prepare'].join('&&')
			},
			emulate: {
				command: ['cd ' + appName, 'cordova run --emulate'].join('&&')
			},
			run: {
				command: ['cd ' + appName, 'cordova run --device'].join('&&')
			},
			compile: {
				command: ['security unlock-keychain -p M@verick1', 
					//'security find-certificate -a -m -c "iPhone Developer: Kenneth Lejnieks (JQW26G33PW)"',
					//'security add-certificate ' + signingKeysPath + partnerIOSCertificate, 
					//'security add-trusted-cert ' + signingKeysPath + partnerIOSCertificate, 
					'/usr/bin/xcrun -sdk iphoneos PackageApplication -v "$(pwd)/' + appName + '/platforms/ios/build/device/' + appName +'.app" -o "$(pwd)/' + appName + '/platforms/ios/build/device/' + appName + '.ipa" --sign "' + iosSigningCommonName + '" --embed "' + signingKeysPath + provisionFile + '"'].join('&&')
			}
		},
		
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['Gruntfile.js', 'www/js/*.js']
		},
		
		phonegapsplash: {

			buildSplashScreens: {

				src: images + 'splash.png',

				dest: images + '/SplashScreens/',

				options: {

					prjName: appName,
					layouts: ['portrait'],

					profiles: ['ios']

				}

			},

		},

	
		replace: {
			iosDevLaunchScreen: {
				src: [appName + '/platforms/ios/' + appName + '/' + appName + '-Info.plist'],
				dest: [appName + '/platforms/ios/' + appName + '/' + appName + '-Info.plist'],
				replacements: [{
					from: /<key>UILaunchImages(\S|\s)+?<\/array>/g,
					to: '<key>UILaunchStoryboardName</key><string>MainViewController</string>'
				}]
			},
			iosDistLaunchScreen: {
				src: [appName + '/platforms/ios/build/device/' + appName + '.app/Info.plist'],
				dest: [appName + '/platforms/ios/build/device/' + appName + '.app/Info.plist'],
				replacements: [{
					from: /<key>UILaunchImages(\S|\s)+?array>/g,
					to: '<key>UILaunchStoryboardName</key><string>MainViewController</string>'
				}]
			},
			indexCordovaScript: {
				src: [appName + '/www/index.html'],
				dest: [appName + '/www/index.html'],
				replacements: [{
					from: /<\/head>/,
					to: '<link rel="stylesheet" href="css/index.css">\n' +
						'<script type="text/javascript" src="cordova.js"></script>\n' +
						'<script type="text/javascript" src="js/plugins/appsflyer.js"></script>\n' +
						'</head>\n'
				}]
			},
			cordovaSplashScreen: {
				src: [appName + '/www/index.html'],
				dest: [appName + '/www/index.html'],
				replacements: [{
					from: /<\/body>/,
					to: '<div id="splash"><div class="logo-container"><img src="img/logo.png"></img></div></div></body>'
				}]
			},
			loginLogo: {
				src: [appName + '/www/js/templates/login.html'],
				dest: [appName + '/www/js/templates/login.html'],
				replacements: [{
					from: /<img src=\"<%= cdn %>\/<%= WLPID %>\/<%= WLP_Logo %>\" (\S|\s)+? \/>/g,
					to: function() {
						if(appName == "driveWealth") {
							return svgImg_drivewealth;
						}
						else {
							return svgImg_avatar;
						}
					}
				}]
			},
			landingLogo: {
				src: [appName + '/www/js/templates/landing.html'],
				dest: [appName + '/www/js/templates/landing.html'],
				replacements: [{
					from: /<img src=\"<%= cdn %>\/<%= WLPID %>\/<%= WLP_Logo %>\" (\S|\s)+? \/>/g,
					to: function() {
						if(appName == "driveWealth") {
							return svgImg_drivewealth;
						}
						else {
							return svgImg_avatar;
						}
					}
				}]
			}
		},
		
		copy: {
			dist: {
				files: [{
					cwd: appName + '/platforms/ios/build/device/',
					dest: 'dist/',
					src: appName + '.ipa',
					expand: true
				}]
			},
			buildFiles: {
				files: [{
					src: 'assets/config.xml',
					dest: appName + '/',
					expand: true,
					flatten: true
					
				}],
				options: {
					process: function(content, srcpath) {
						return content.replace("APP_NAME", appName).replace("NAME_SPACE", ns);
					}
				}
			},
			splashScreen: {
				files: [{
					cwd: images + '/SplashScreens/platforms/ios/' + appName + '/Resources/splash/',
					dest: appName + '/www/res/screen/ios/',
					src: ["*","**"],
					expand: true 
				}]
			},
			partnerFiles: {
				files: [{
					cwd: "../../html5-trader/www/",
					dest: appName + '/www/',
					src: ["*","**"],
					expand: true
				},{
					cwd: css,
					dest: appName + '/www/css/',
					src: 'index.css',
					expand: true
				},{
					cwd: js,
					dest: appName + '/www/js/',
					src: 'index.js',
					expand: true
				},{
					cwd: images,
					dest: appName + '/www/img/',
					src: 'logo.png', 
					expand: true
				},{
					cwd: icons,
					dest: appName + '/www/res/icon/ios/',
					src: ["*","**"], 
					expand: true
				}/*,{
					cwd: images,
					dest: appName + '/www/img/',
					src: 'splash.jpg', 
					expand: true
				},{
					cwd: index,
					dest: appName + '/www/',
					src: 'index.html', 
					expand: true
				}*/]
			}
		},
		
		clean: {
			dist: [appName]
		}		
		
	});


	/////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-phonegapsplash');
	

	// Default task
	grunt.registerTask('default', ['clean:dist', 'shell:create', 'shell:prepare', 'copy:buildFiles', 'copy:partnerFiles', 'replace:indexCordovaScript', 'replace:loginLogo', 'replace:landingLogo', 'phonegapsplash', 'copy:splashScreen', 'shell:addPlugins', 'shell:build']);
  
  	grunt.registerTask('create', ['shell:create']);
  	
  	grunt.registerTask('emulate', ['shell:emulate']);
  
	grunt.registerTask('compile', ['clean:dist', 'shell:create', 'shell:prepare', 'copy:buildFiles', 'copy:partnerFiles', 'replace:indexCordovaScript', 'replace:loginLogo', 'replace:landingLogo', 'phonegapsplash', 'copy:splashScreen', 'shell:build', 'shell:compile', 'copy:dist', 'clean']);
	
	//grunt.registerTask('buildPartnerIpa', ['shell:create', 'shell:prepare', 'copy:partnerFiles', 'shell:build', 'shell:buildIpa', 'copy']);
  
};
