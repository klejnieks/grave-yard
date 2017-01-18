module.exports = function(grunt) {
	
	var index = 0; 
	var partners = grunt.config.data.partners.partners;
	var timer = 0;
	
	grunt.event.on("stepCompleteEvent", function() {
		if(index < partners.length) {
			grunt.log.writeln('Recieved Event: stepCompleteEvent'['white']);
			grunt.log.writeln();
			grunt.log.writeln();
			grunt.task.run("compile-partner");
		}
	});
	
	grunt.registerTask('build-all', 'Build all white label patners', function () {
		console.log("BUILDING ALL THINGS");

	});
	
	grunt.registerTask('compile-partner', 'Compile all white label patners', function () {
		
		var done = this.async();
		
		grunt.config.data.wlpid = partners[index];
		grunt.config.data.wlpdata = grunt.file.readJSON('wlp-config/' + grunt.config.data.wlpid + '.json');
		grunt.config.data.wlpname = grunt.config.data.wlpdata.displayName.toLowerCase();
		grunt.config.data.wlpfiles = '../../html5-trader/dist/<%= grunt.config.data.buildNo %>/<%= grunt.config.data.wlpid %>/';
		grunt.config.data.ns = grunt.config.data.domain + '.' + grunt.config.data.wlpname;
		grunt.config.data.buildPath = grunt.config.data.distPath + '/' + grunt.config.data.wlpid;
		
		grunt.log.writeln('#########################################'['red']);
		grunt.log.writeln('Now Compiling White Label Partner -- '['red'] + grunt.config.data.wlpid['red'] + ', '['red'] + grunt.config.data.wlpname['red']);
		grunt.log.writeln('#########################################'['red']);
		
		grunt.task.run("shell:create-cordova-project");
		grunt.task.run("shell:prepare-cordova-project");
		
		grunt.task.run("copy:partner-files");
		grunt.task.run("copy:build-files");
		
		grunt.task.run("replace:config-xml");
		grunt.task.run("replace:index-cordova-script");
		 
		grunt.task.run("build-images");
		
		grunt.task.run("shell:add-plugins");
		grunt.task.run("shell:build");
		grunt.task.run("shell:compile-ios");
		//grunt.task.run("shell:run");

		grunt.task.run("copy:dist");

		grunt.task.run("complete-step");
		
		index++
		
		done();

	});
};




