module.exports = function(grunt) {
	
	var path = require('path');
	
	require('time-grunt')(grunt);
	
	require('load-grunt-config')(grunt, {
		configPath: path.join(process.cwd(), 'grunt/config'),
		overridePath: undefined,
		init: true,
		jitGrunt: {
			customTasksDir: path.join(process.cwd(), 'grunt/tasks')
		},
		data: {
			wlpid: undefined,
			wlpname: undefined,
			wlpdata: undefined,
			wlpfiles: undefined,
			buildNo: grunt.option('number') || (new Date()).getTime(),
			distPath: undefined,
			buildPath: undefined,
			logoIconCDN: 'http://syscdn.drivewealth.io',
			domain: 'com.noroso',
			ns: undefined
		},
		loadGruntTasks: {
			pattern: 'grunt-*',
			config: require('./package.json'),
			scope: 'devDependencies'
		},
		postProcess: function(config) {
			//
		},
		preMerge: function(config, data) {
			//data.partners = grunt.file.readJSON('wlp-config/partners.json');
			//data.distPath = path.join(process.cwd(), 'dist/' + data.buildNo);
		}
	});
	
	//grunt.registerTask('default', ['build-images']);
	grunt.registerTask('default', ['build-all']);
	
};
