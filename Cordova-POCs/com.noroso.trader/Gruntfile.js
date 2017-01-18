/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		appName: 'Test2',
		meta: {
			banner: '/*! <%= pkg.name || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		concat: {
			dist: {
				src: ['www/js/**/*.js'],
				dest: 'www/js/<%= pkg.name %>.concat.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				mangle: true,
				beautify: false
			},      
			dist: {
				src: 'www/js/<%= pkg.name %>.js',
				dest: 'www/js/<%= pkg.name %>.min.js'
			}
		},
		shell: {
			options: {
				failOnError: true,
				stdout: false,
				stderr: true
			},
			create: {
				command: [ 'cordova create <%= appName =%> com.noroso.test2 <%= appName =%>',
					'cd <%= appName =%>',
					'cordova platform add ios', 
					'cordova build ios',
					'cordova run ios'
				].join('&&')
			},
			build: {
				command: 'cordova build ios'// android'
			},
			prepare: {
				command: 'cordova prepare'
			},
			emulate: {
				command: 'cordova run --emulate'
			},
			run: {
				command: 'cordova run --device'
			},
			buildIpa: {
				command: '/usr/bin/xcrun -sdk iphoneos PackageApplication -v "/<projectPath>/platforms/ios/build/Crocpad.app" -o "/<projectPath>/platforms/ios/build/CrocPad.ipa" --sign "iPhone Distribution: Rhino Software Pty Ltd (F86TA6JRXE)" --embed "/<projectPath>/Dev/Keys/iOS/Rhino_Software_AdHoc.mobileprovision"'
			}
		},
		jshint: {
			options: {
				boss: true,
				devel: true,
				browser: true,
				jquery: true
			},
			all: ['Gruntfile.js', 'www/js/*.js']
		},
		copy: {
			main: {
				files: [{
					expand: true, 
					flatten: true, 
					filer: 'isFile',
					src: ['platforms/ios/build/CrocPad.ipa'], 
					dest: '/<projectPath>/Dev/Client/buid/ios/'
				},{
					expand: true, 
					flatten: true,
					src: ['platforms/android/bin/CrocPad-debug.apk'], 
					dest: '/<projectPath>/Dev/Client/buid/android/'
				},{
					expand: true, 
					flatten: true,
					src: ['package.json'], 
					dest: '/<projectPath>/Dev/Client/buid/'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task
	grunt.registerTask('default', ['shell:build', 'shell:buildIpa', 'copy']);
  
 	// Custom tasks
	grunt.registerTask('prepare', ['jshint', 'shell:prepare']);
  
	// Custom tasks
	grunt.registerTask('ipa', ['shell:buildIpa', 'copy']);
  
};
