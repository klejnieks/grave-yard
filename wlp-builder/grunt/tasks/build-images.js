module.exports = function(grunt) {
	
	grunt.registerTask('build-images', 'Build all white label patners', function () {
		grunt.task.run("run:make-res-directory");
		grunt.task.run("run:make-icon-images");
		grunt.task.run("run:make-splash-screen-master-image");
		grunt.task.run("phonegapsplash:build-splash-screens");
		grunt.task.run("copy:generated-android-splash-screens");
		grunt.task.run("copy:generated-ios-splash-screens");
		grunt.task.run("clean:generated-splash-screens");
	});
	
};




