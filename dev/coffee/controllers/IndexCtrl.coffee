Ctrl = require('../framework/Ctrl')

module.exports = class IndexCtrl extends Ctrl
	constructor: (app)->
		super(app)
		@app.redirect '/documents' if @app.user.isAuth()
	do: ->
		$('button').click =>
			OAuth.popup 'github', (err, res) =>
				return console.log err if err
				res.get('/user').done (data) =>
					console.log 'login', res, data
					@app.user.login data.login, access_token: res.access_token, provider: 'github'
					@app.redirect '/documents'
