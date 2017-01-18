/*
module.exports = function(grunt) {
	var path = require('path');

	require('load-grunt-config')(grunt, {
		configPath: path.join(process.cwd(), 'grunt/config'),
		jitGrunt: {
			customTasksDir: 'grunt/tasks'
		},
		data: {
			foo: 'bar' // accessible with '<%= foo %>'
		}
	});
};

*/

module.exports = function(grunt) {
	
	var path = require('path');
	
	require('time-grunt')(grunt);
	
	require('load-grunt-config')(grunt, {
		configPath: path.join(process.cwd(), 'grunt/tasks'),
		init: true,
		jitGrunt: true,
		data: {
			test: false
		},
		loadGruntTasks: {
			pattern: 'grunt-*',
			config: require('./package.json'),
			scope: 'devDependencies'
		},
		postProcess: function(config) {
			console.log("*************************");
			console.log(config.package.config);
		},
		preMerge: function(config, data) {
			console.log("*************************");
			console.log(data);
		}
	});
	
	//grunt.registerTask('default', ['sass:dist']);

};