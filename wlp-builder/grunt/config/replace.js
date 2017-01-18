module.exports = {
	"config-xml": {
		options: {
			patterns: [{
	              match: 'APP_NAME',
	              replacement: '<%= grunt.config.data.wlpname %>'
			},{
	              match: 'NAME_SPACE',
	              replacement: '<%= grunt.config.data.ns %>'
			}]
		},
		files: [{
			expand: true, 
			flatten: true, 
			src: ['assets/config.xml'], 
			dest: '<%= grunt.config.data.buildPath %>/'
		}]
	},
	"index-cordova-script": {
		options: {
			patterns: [{
	              match: /<\/head>/,
	              replacement: '<link rel="stylesheet" href="css/index.css">\n' +
					'<script type="text/javascript" src="cordova.js"></script>\n' +
					'<script type="text/javascript" src="js/plugins/appsflyer.js"></script>\n' +
					'</head>\n'
			}]
		},
		files: [{
			expand: true, 
			flatten: true, 
			src: ['<%= grunt.config.data.buildPath %>/www/index.html'], 
			dest: '<%= grunt.config.data.buildPath %>/www/'
		}]
	}
};