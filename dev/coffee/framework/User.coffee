module.exports = class User
	constructor: (@app) ->
		console.log 'construct user', @app.env.get('auth'), @app.env.get('access_token'), @app.env.get('provider')
		if @app.env.get('auth') and @app.env.get('access_token') and @app.env.get('provider')
			@github = new Github(token: @app.env.get('access_token'), auth: 'oauth') if @app.env.get('provider') == 'github'

	login: (username, social) ->
		@app.env.set 'auth', true
		@app.env.set 'username', username
		if social.provider and social.access_token
			@app.env.set 'access_token', social.access_token
			@app.env.set 'provider', social.provider
			@github = new Github(token: social.access_token, auth: 'oauth') if social.provider == 'github'

		@app.event.emit "login"

	setRight: (@right) ->

	isAuth: () ->
		return @app.env.get 'auth'

	logout: () ->
		@github = null
		@app.env.set 'auth', false
		@app.env.set 'username', ''
		@app.env.set 'access_token', ''
		@app.env.set 'provider', ''

		@app.event.emit 'logout'