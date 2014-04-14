module.exports = class Env
	data = {}
	constructor: () ->
		if localStorage
			try
				data = JSON.parse(localStorage.getItem('env'))
			data = {} if not data

		console.log data
	set: (key, value) ->
		data[key] = value
		if localStorage
			localStorage.setItem 'env', JSON.stringify(data)
	get: (key) -> data[key]
