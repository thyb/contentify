module.exports = class Env
	constructor: (data) ->
		@data = []
		@data = data if data?.length > 0
	set: (key, value) -> @data[key] = value
	get: (key) -> @data[key]