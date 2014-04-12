Ctrl = require('../framework/Ctrl')
config = require('../config')
DocumentManagerService = require('../services/DocumentManagerService')

module.exports = class DocumentsCtrl extends Ctrl
	constructor: (app) ->
		super(app)

		console.log "construct dashboard", @app.user.isAuth()

		return @app.redirect '/' if not @app.user.isAuth()

		console.log @app.user
		@services.documentManager = new DocumentManagerService(@app.user.github)

	initialize: (callback) ->
		@services.documentManager.list (err, data) =>
			if err == 'not found'
				return callback documents: null if callback
			console.log "list", data
			@app.documents = data
			callback documents: data if callback

	do: ->
		$('#create-document').click ->
			$('#new-document-modal').modal('show')

		$('#name-input').keyup ->
			$('#slug-input').val $(this).val().dasherize()

		$('#create-button').click =>
			type = $('#new-document-modal .btn-group label.active').text().trim().toLowerCase()
			if type == 'markdown'
				type = 'md'

			formData =
				name: $('#name-input').val()
				slug: $('#slug-input').val()
				extension: type

			@services.documentManager.create formData, (err) =>
				$('.modal-backdrop').remove()
				@app.redirect '/document/' + formData.slug
