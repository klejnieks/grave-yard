module.exports = {
	"build-splash-screens": {
		src: '<%= grunt.config.data.buildPath %>/www/res/screen/splash.png',
		dest: '<%= grunt.config.data.buildPath %>/www/res/screen/',
		options: {
			layouts: ['portrait'],
			profiles: ['ios', 'android']
		}
	}
};