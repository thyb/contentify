Ctrl = require('../framework/Ctrl')
DocumentManagerService = require('../services/DocumentManagerService')


module.exports = class DocumentsCtrl extends Ctrl
	constructor: (app, params) ->
		super(app, params)
		return @app.redirect '/' if not @app.user.isAuth()

		@services.documentManager = new DocumentManagerService(@app.user.github)

	initialize: (callback) ->
		@services.documentManager.checkAccess @app.user.get('login'), (access) =>
			return @app.redirect '/403' if not access
			@access = access
			@services.documentManager.list @params.foldername, (err, data) =>
				# console.log err, data
				if err == 'not found'
					return @app.redirect '/404'
				@app.documents = data
				callback documents: data, documentsPath: @services.documentManager.getCurrentPath() if callback

	do: ->
		if @access == 'guest'
				$("#create-document").hide()
				$('#read-only').show()

		$('#create-document').click ->
			$('#new-document-modal').modal('show')

		$('#create-folder').click ->
			$('#new-folder-modal').modal('show')

		$('#new-document-modal .create-button').click =>
			formData =
				title: $('#name-input').val()
				filename: $('#filename-input').val() + '.md'

			@services.documentManager.create formData.filename, formData.title, (err) =>
				if err
					err.msg = JSON.stringify err if not err.msg
					$('#new-document-modal form .alert').html(err.msg).removeClass 'hide'
					return false

				$('.modal-backdrop').remove()
				$('body').removeClass('modal-open')
				if @params.foldername
					@app.redirect '/document/' + @params.foldername + '/' + formData.filename
				else
					@app.redirect '/document/' + formData.filename

		$('#new-folder-modal .create-button').click =>
			formData =
				name: $('#new-folder-modal .name-input').val()

			@services.documentManager.createFolder formData.name, (err) =>
				if err
					err.msg = JSON.stringify err if not err.msg
					$('#new-document-modal form .alert').html(err.msg).removeClass 'hide'
					return false

				$('.modal-backdrop').remove()
				$('body').removeClass('modal-open')
				if @params.foldername
					@app.redirect '/documents/' + @params.foldername + '/' + formData.name
				else
					@app.redirect '/documents/' + formData.name
