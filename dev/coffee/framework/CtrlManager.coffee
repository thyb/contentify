module.exports = class CtrlManager
	constructor: (@app) ->
		@partials = []
	setMaster: (ctrl, params, callback) ->
		@master = new ctrl @app, params
		console.log @app.router.stop, params.path
		return (@app.router.stop = false) if @app.router.stop and @app.router.stop isnt params.path
		@master.use callback
	addPartial: (ctrl, placement, callback) ->
		@partials.push ctrl: new ctrl @app, placement: placement
		@partials[@partials.length - 1].ctrl.use callback
	removePartial: (ctrl, placement) ->
		for partial of @partials
			if partials[partial].placement == placement
				delete partials[partial]
		$(placement).html ''
