module.exports = class Env
	data = {}
	constructor: () ->
		if localStorage
			console.log 'has local storage'
			try
				data = JSON.parse(localStorage.getItem('env'))
			data = {} if not data

		console.log data
	set: (key, value) ->
		console.log 'env set', key, value
		data[key] = value
		console.log data
		if localStorage
			console.log 'set localstorage to', data
			localStorage.setItem 'env', JSON.stringify(data)
	get: (key) -> data[key]
