View = require('./View')

module.exports = class Ctrl
	constructor: (@app, @params) ->
		ctrlname = @constructor.name
		ctrlname = ctrlname.substr(0, ctrlname.length - 4)
		ctrlname = ctrlname.replace(/([A-Z])/g, "-$1")
		@templateUrl = ctrlname.substr(1).toLowerCase() + '.html'
		# @templateUrl = @constructor.name.substr(0, @constructor.name.length - 4).toLowerCase() + '.html'
		@scope = {}
		@view = new View()
		@services = {}
		@_askedForRedirect = false

	use: (callback) ->
		@render =>
			@do()
			callback if callback()

	initialize: (callback) -> callback() if callback
	do: ->
	render: (callback) ->
		@initialize (params) =>
			@view.render @templateUrl, params, @app.router.defaultPlacement, callback

	include: (ctrl, placement, callback) ->

	setView: (template) ->
		@templateUrl = template + '.html'
	unload: ->
		$(window).unbind 'beforeunload' if @_askedForRedirect