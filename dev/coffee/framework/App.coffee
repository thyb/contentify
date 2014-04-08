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
			@ready = true
			@start() if @started
		return @

	start: ->
		@started = true
		if @ready
			hash = window.location.hash
			if hash and (hash != '#' or hash != '#/')
				@router.change hash
			else if not @router._state
				@router.change '/'
			else
				@router.change @router._state

	include: (ctrl, placement) ->
		@ctrlManager.addPartial ctrl, placement

	setTitle: (title) ->

	setMeta: (meta, value) ->