module.exports = function(grunt) {
	grunt.initConfig({

		less : {
			development : {
				options : {
					paths : ["src"]
				},
				files : {
					"css/asi.css" : "less/asi.less"
				}
			},
			production : {
				options : {
					paths : ["src"],
					cleancss : true
				},
				files : {
					"css/asi.css" : "less/asi.less"
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.registerTask('default', ['less']);
}; 