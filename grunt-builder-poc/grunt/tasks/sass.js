module.exports = {
	dist: {
		options: {
			style: 'compressed',
			sourcemap: 'none'
		},
		files: {
			'dist/css/app.min.css': 'scss/app.scss'
		}
	}
};