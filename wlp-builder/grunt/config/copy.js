var self = this;

var tmp = function(content, srcpath, grunt) {
	console.log("TEMP: " + grunt);
	//return content.replace("APP_NAME", grunt.config.data.appName).replace("NAME_SPACE", grunt.config.data.ns);
}

module.exports = {
	"generated-android-splash-screens":{
		files: [{
			expand: true, 
            cwd: '<%= grunt.config.data.buildPath %>/www/res/screen/platforms/android/res/', 
            src: ['**/*.png'], 
            dest: '<%= grunt.config.data.buildPath %>/www/res/screen/android/',
			rename: function(dest, src) {
	              return dest + src.substring(0, src.indexOf('/')).replace("drawable-port", "screen").concat("-portrait") + '.png';
	            }
		}]
	},
	"generated-ios-splash-screens":{
		files: [{
			expand: true,
			flatten: true,
			src: ['<%= grunt.config.data.buildPath %>/www/res/screen/platforms/ios/Test/Resources/splash/*'], 
			dest: '<%= grunt.config.data.buildPath %>/www/res/screen/ios/' 
		}]
	},
	"dist": {
		files: [{
			cwd: '<%= grunt.config.data.buildPath %>/platforms/ios/build/device/',
			dest: 'dist/',
			src: '<%= grunt.config.data.wlpname %>.ipa',
			expand: true
		}]
	},
	"build-files": {
		src: 'assets/config.xml',
		dest: '<%= grunt.config.data.buildPath %>/',
		expand: true,
		flatten: true
	},
	"partner-files": {
		files: [{
			cwd: "<%= grunt.config.data.wlpfiles %>",
			dest: '<%= grunt.config.data.buildPath %>/www/',
			src: ["*","**"],
			expand: true
		}]
	}
};