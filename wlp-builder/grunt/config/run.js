module.exports = {
	"make-res-directory":{
		cmd: 'grunt/bash/make-res-directory.sh',
		args: ['<%= grunt.config.data.buildPath %>']
	},
	"make-icon-images":{
		cmd: 'grunt/bash/make-icon-images.sh',
		args: ['<%= grunt.config.data.logoIconCDN %>/<%= grunt.config.data.wlpid %>/<%= grunt.config.data.wlpdata.paths.WLP_LOGO_FAVICON_KEY %>', 
		       '#<%= grunt.config.data.wlpdata.colors.brand.ICON_BG %>', 
		       '<%= grunt.config.data.buildPath %>']
	},
	"make-splash-screen-master-image":{
		cmd: 'grunt/bash/make-splash-screen-master-image.sh',
		args: ['<%= grunt.config.data.logoIconCDN %>/<%= grunt.config.data.wlpid %>/<%= grunt.config.data.wlpdata.paths.WLP_LOGO_INAPP_PATH_KEY %>', 
		       '#<%= grunt.config.data.wlpdata.colors.brand.SPLASH_BG %>', 
		       '<%= grunt.config.data.buildPath %>']
	}
};