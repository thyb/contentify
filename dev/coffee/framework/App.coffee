Router = require('./Router')
Env = require('./Env')
GlobalEvent = require('./GlobalEvent')
CtrlManager = require('./CtrlManager')
TemplateManager = require('./TemplateManager')
LayoutManager = require('./LayoutManager')

module.exports = class App
	constructor: () ->
		# TODO: load env from localstorage
		@env = new Env()
		@event = new GlobalEvent()
		@ctrlManager = new CtrlManager @
		@templateManager = TemplateManager
		@layoutManager = LayoutManager
		@ready = true
		@auth = false

	initializeRouter: (setting) ->
		@router = new Router @, setting
		return @router

	setLayout: (layout) ->
		@ready = false
		@layoutManager.set layout, =>
			@router.setDefaultPlacement '#content'
			@ready = true
			@start() if @started
		return @

	start: ->
		@started = true
		if @ready
			hash = window.location.hash
			console.log 'router start', hash, @router._state
			if hash and hash != '#'
				@redirect hash.substr(1)
			else if not @router._state
				@redirect '/'
			else
				@redirect @router._state

	redirect: (path) ->
		console.log 'redirect', path
		@router.stopPropagate(path).change path


	login: (access_token, provider) ->
		@access_token = access_token
		@auth = true
		@env.set 'access_token', access_token
		@event.emit "login"

		if provider
			@github = new Github(token: access_token, auth: 'oauth') if provider == 'github'

	logout: (provider) ->
		@auth = false
		@access_token = null
		@env.set 'access_token', null
		@event.emit 'logout'

		if provider
			@github = null of provider == 'github'

	refreshMenu: (path) ->
		console.log "refreshing menu", path, @menu
		return false if not @menu
		$('li.active', @menu).removeClass 'active'
		$('li a[href="#' + path + '"]').parent().addClass 'active'
		$('li.need-auth').hide() if not @auth
		$('li.need-auth').show() if @auth

	setMenu: (selector) ->
		console.log "set menu selector", selector
		@menu = selector
		return @

	setTitle: (title) ->

	setMeta: (meta, value) ->
