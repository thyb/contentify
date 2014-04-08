Ctrl = require('../framework/Ctrl')
config = require('../config')

module.exports = class DashboardCtrl extends Ctrl
	initialize: (callback) ->
		repo = @app.env.get('github').getRepo config.username, config.repository
		console.log repo
		repo.read 'master', 'documents.json', (err, data) ->
			if err == 'not found'
				return callback documents: null if callback
			callback documents: data if callback
	do: ->
		$('#create-document').click =>
			@app.router.change('/documents/new')