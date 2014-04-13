module.exports = class User
	constructor: (@app) ->
		if @app.env.get('auth')
			if @app.env.get('access_token') and @app.env.get('provider')
				@github = new Github(token: @app.env.get('access_token'), auth: 'oauth') if @app.env.get('provider') == 'github'

	initialize: () ->
		if @app.env.get('auth')
			@app.event.emit "login"

	login: (userinfo, social) ->
		@app.env.set 'auth', true
		@app.env.set 'userinfo', userinfo
		if social.provider and social.access_token
			@app.env.set 'access_token', social.access_token
			@app.env.set 'provider', social.provider
			@github = new Github(token: social.access_token, auth: 'oauth') if social.provider == 'github'

		@app.event.emit "login"

	setRight: (@right) ->

	isAuth: () ->
		return @app.env.get 'auth'

	get: (key) ->
		return @app.env.get('userinfo')[key]

	logout: () ->
		@github = null
		@app.env.set 'auth', false
		@app.env.set 'username', ''
		@app.env.set 'access_token', ''
		@app.env.set 'provider', ''

		@app.event.emit 'logout'