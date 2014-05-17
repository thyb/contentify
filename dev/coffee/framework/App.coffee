Router = require('./Router')
Env = require('./Env')
GlobalEvent = require('./GlobalEvent')
CtrlManager = require('./CtrlManager')
TemplateManager = require('./TemplateManager')
LayoutManager = require('./LayoutManager')
User = require('./User')

module.exports = class App
	constructor: () ->
		Handlebars.registerHelper 'encodeurl', (text) ->
			encodeURIComponent(text)


		# TODO: load env from localstorage
		@env = new Env()
		@event = new GlobalEvent()
		@ctrlManager = new CtrlManager @
		@templateManager = TemplateManager
		@layoutManager = LayoutManager
		@ready = true
		@user = new User(@)

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
			@user.initialize()
			hash = window.location.hash
			if hash and hash != '#'
				@redirect hash.substr(1)
			else if not @router._state
				@redirect '/'
			else
				@redirect @router._state

	askForRedirect: (msg, answer) ->
		if not msg
			@_askedForRedirect = false
			@_askedForRedirectFct = null
		else
			@_askedForRedirect = true
			@_askedForRedirectFct = answer
			$(window).bind 'beforeunload', ->
				return 'Your local changes might be lost'

	redirect: (path) ->
		if @_askedForRedirect
			answer = @_askedForRedirectFct()
			if not answer or (answer and confirm('Are you sure you want to quit this page? all local changes will be lost.'))
				@_askedForRedirect = false
				@_askedForRedirectFct = null
				$(window).unbind 'beforeunload'
				@router.stopPropagate(path).change path
			else
				@router.nextNoRedirect = true
				@router.changeHash @router._state

		else
			@router.stopPropagate(path).change path

	refreshMenu: (path) ->
		return false if not @menu
		$('li.active', @menu).removeClass 'active'
		$('li a[href="#' + path + '"]').parent().addClass 'active'
		$('li.need-auth').hide() if not @user.isAuth()
		$('li.need-auth').show() if @user.isAuth()

	setMenu: (selector) ->
		@menu = selector
		return @

	setTitle: (title) ->

	setMeta: (meta, value) ->
