CtrlEvent = require('./CtrlEvent')
View = require('./View')

module.exports = class Ctrl
	constructor: (@app, @params) ->
		ctrlname = @constructor.name
		ctrlname = ctrlname.substr(0, ctrlname.length - 4)
		ctrlname = ctrlname.replace(/([A-Z])/g, "-$1")
		@templateUrl = ctrlname.substr(1).toLowerCase() + '.html'
		console.log @templateUrl
		# @templateUrl = @constructor.name.substr(0, @constructor.name.length - 4).toLowerCase() + '.html'
		@scope = {}
		@event = new CtrlEvent()
		@view = new View()
		@services = {}

	use: (callback) ->
		@render =>
			@do callback

	initialize: (callback) -> callback() if callback
	do: (callback) -> callback() if callback
	render: (callback) ->
		@initialize (params) =>
			@view.render @templateUrl, params, @app.router.defaultPlacement, callback
