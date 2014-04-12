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

	include: (ctrl, placement) ->
		@ctrlManager.addPartial ctrl, placement

	redirect: (path) ->
		console.log 'redirect', path
		@router.stopPropagate(path).change path

	setTitle: (title) ->

	setMeta: (meta, value) ->
