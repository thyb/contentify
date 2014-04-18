Ctrl = require('../framework/Ctrl')

module.exports = class ErrorCtrl extends Ctrl
	constructor: (app, params) ->
		super(app)
		if params.path == '/403'
			@setView 'error/403'
		else
			@setView 'error/404'
	do: ->