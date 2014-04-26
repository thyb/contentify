Ctrl = require('../framework/Ctrl')
DocumentManagerService = require('../services/DocumentManagerService')


module.exports = class DocumentsCtrl extends Ctrl
	constructor: (app) ->
		super(app)
		return @app.redirect '/' if not @app.user.isAuth()

		@services.documentManager = new DocumentManagerService(@app.user.github)

	initialize: (callback) ->
		@services.documentManager.checkAccess @app.user.get('login'), (access) =>
			return @app.redirect '/403' if not access
			@services.documentManager.list (err, data) =>
				if err == 'not found'
					return callback documents: null if callback
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
				$('body').removeClass('modal-open')
				@app.redirect '/document/' + formData.slug
