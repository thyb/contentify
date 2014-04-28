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

		$('#create-button').click =>
			formData =
				title: $('#name-input').val()
				filename: $('#filename-input').val()

			@services.documentManager.create filename, title, (err) =>
				if err
					err.msg = JSON.stringify err if not err.msg
					$('#new-document-modal form .alert').html(err.msg).removeClass 'hide'
					return false

				$('.modal-backdrop').remove()
				$('body').removeClass('modal-open')
				@app.redirect '/document/' + formData.filename
