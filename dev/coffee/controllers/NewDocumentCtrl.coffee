Ctrl = require('../framework/Ctrl')
config = require('../config')

module.exports = class NewDocumentCtrl extends Ctrl
	initialize: (callback) -> callback() if callback
	do: ->