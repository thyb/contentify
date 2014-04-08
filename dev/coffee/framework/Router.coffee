View = require('./View')

module.exports = class Router
	constructor: (@app, setup) ->
		@_routes = setup
		@changingHash = false
		@defaultPlacement = 'body'
		$(window).on 'hashchange', =>
			if not @changingHash
				@change window.location.hash.substr(1)
			else
				@changingHash = false

	setDefaultPlacement: (@defaultPlacement) ->	return @

	changeHash: (path) ->
		@_state = path
		@changingHash = true
		window.location.hash = @_state

	change: (path) ->
		for route of @_routes
			if route == path
				if @_routes[route].ctrl
					masterCtrl = @_routes[route].ctrl
				else
					masterCtrl = @_routes[route]
				break
			if route == path.substr 0, route.length and path.substr route.length, 1 == '/' and @_routes[route].ctrl and @_routes[route].partials
				partial = path.substr route.length
				masterCtrl = @_routes[route].ctrl
				for routePartial in @routes[route].partials
					if routePartial == partial
						partialObj = routePartial
						break

		if not masterCtrl
			@change '/404'

		@changeHash path

		@app.ctrlManager.setMaster masterCtrl, =>
			if partialObj
				@app.ctrlManager.addPartial partialObj.ctrl, partialObj.container

		return @