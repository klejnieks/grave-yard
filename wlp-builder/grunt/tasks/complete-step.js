module.exports = function(grunt) {
	
	grunt.registerTask('complete-step', 'Fires a complete event to continue', function() {
		grunt.event.emit("stepCompleteEvent");
	});
};