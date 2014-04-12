Ctrl = require('../framework/Ctrl')

module.exports = class IndexCtrl extends Ctrl
	constructor: (app)->
		super(app)
		@app.redirect '/documents' if @app.auth
	do: ->
		OAuth.initialize 'poZr5pdrx7yFDfoE-gICayo2cBc'
		$('button').click =>
			OAuth.popup 'github', (err, res) =>
				return console.log err if err
				@app.login res.access_token, 'github'
				@app.redirect '/documents'
