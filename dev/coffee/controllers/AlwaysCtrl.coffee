Ctrl = require('../framework/Ctrl')

module.exports = class AlwaysCtrl extends Ctrl
	initialize: (callback) -> callback() if callback
	do: ->
	on:
		"signin": ->
		"logout": ->