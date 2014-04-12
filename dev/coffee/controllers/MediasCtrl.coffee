Ctrl = require('../framework/Ctrl')

module.exports = class MediasCtrl extends Ctrl
	constructor: (app) ->
		super(app)

	initialize: (callback) ->
		callback() if callback

	do: () ->