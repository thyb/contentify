Ctrl = require('../framework/Ctrl')

module.exports = class IndexCtrl extends Ctrl
	constructor: (app)->
		super(app)
		@app.redirect '/documents' if @app.user.isAuth()

	do: ->
		$('button.btn-primary').click =>
			OAuth.popup 'github', (err, res) =>
				return console.log err if err
				res.get('/user').done (data) =>
					@app.user.login data, access_token: res.access_token, provider: 'github'
					@app.redirect '/documents'