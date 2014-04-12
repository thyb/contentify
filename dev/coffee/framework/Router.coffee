View = require('./View')

module.exports = class Router
	constructor: (@app, setup) ->
		@_routes = setup
		@changingHash = false
		@defaultPlacement = 'body'
		$(window).hashchange =>
			@app.redirect window.location.hash.substr(1)

	setDefaultPlacement: (@defaultPlacement) ->	return @

	changeHash: (path) ->
		@_state = path
		@changingHash = true
		window.location.hash = @_state

	_checkPath: (path) ->
		#check if path match a route from settings
		masterParams = new Array()

		for route of @_routes
			if route.indexOf('/:') isnt -1
				res = route.match(/\/:([a-zA-Z0-9]+)/)
				res.shift()
				params = res
				console.log res, res.length

				regexpStr = route.replace(/\/:[a-zA-Z0-9]+/g, '/([a-zA-Z0-9_-]+)').replace(/\//g, '\\/')
				res = path.match(new RegExp(regexpStr))
				continue if not res
				res.shift()
				for param of params
					continue if param == 'index' or param == 'input'
					console.log 'for', param
					masterParams[params[param]] = res[param]

				console.log masterParams

				if @_routes[route].ctrl
					masterCtrl = @_routes[route].ctrl
				else
					masterCtrl = @_routes[route]
			else if route == path
				if @_routes[route].ctrl
					masterCtrl = @_routes[route].ctrl
				else
					masterCtrl = @_routes[route]
				break
#			if route == path.substr 0, route.length and path.substr route.length, 1 == '/' and @_routes[route].ctrl and @_routes[route].partials
#				partial = path.substr route.length
#				masterCtrl = @_routes[route].ctrl
#				for routePartial in @routes[route].partials
#					if routePartial == partial
#						partialObj = routePartial
#						break


		masterParams['path'] = path
		console.log 'params', masterParams
		return {
			master: masterCtrl
			masterParams: masterParams
			partial: null
		}

	stopPropagate: (path) ->
		@stop = path
		return @

	change: (path) ->
		res = @_checkPath path

		if not res.master
			return @change '/404'


		@changeHash path

		@app.ctrlManager.setMaster res.master, res.masterParams, =>
			@stop = false if @stop
			# if res.partial
			#	@app.ctrlManager.addPartial res.partial.ctrl, res.partial.container

		return @
