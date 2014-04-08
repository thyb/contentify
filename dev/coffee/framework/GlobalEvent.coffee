module.exports = class GlobalEvent
	constructor: () ->
		@listeners = []

	emit: (name, value) ->
		for listener in @listeners
			if listener.name == name
				listener.callback value
	receive: (name, callback) ->
		@listeners.push name: name, callback: callback