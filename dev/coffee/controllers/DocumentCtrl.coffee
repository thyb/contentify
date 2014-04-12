Ctrl = require('../framework/Ctrl')
DocumentManagerService = require('../services/DocumentManagerService')

module.exports = class DocumentCtrl extends Ctrl
	constructor: (app, params) ->
		super(app, params)

		return @app.redirect '/' if not @app.user.isAuth()

		@services.documentManager = new DocumentManagerService(@app.user.github)

		Handlebars.registerHelper 'releaseDotImg', (passedString) ->
			if passedString.substr(0, 6) == 'Delete'
				return 'img/delete-dot.png'
			else
				return 'img/release-dot.png'

	initialize: (callback) ->
		@services.documentManager.getDocument @params.slug, (doc) =>
			@app.redirect '/documents' if not doc
			@services.documentManager.getDocumentHistory @params.slug, (err, documentHistory) =>
				@services.documentManager.getReleaseHistory @params.slug, (err, releaseHistory) =>
					localContent = JSON.parse(localStorage.getItem(@params.slug))
					localChanges = false
					if localContent?[@params.slug]?.content.length > 0 and localContent?[@params.slug]?.content.trim() != doc.lastVersion
						localChanges = true

					merge = @services.documentManager.mergeHistory(releaseHistory, documentHistory)
					@viewParams =
						doc: doc
						slug: @params.slug
						diff: documentHistory
						history: merge
						localChanges: localChanges
					callback @viewParams if callback

	checkLocalChanges: (callback) ->
		localContent = JSON.parse(localStorage.getItem(@params.slug))
		localChanges = false
		if localContent?[@params.slug]?.content.length > 0 and localContent[@params.slug].content.trim() != @viewParams.doc.lastVersion
			localChanges = true
		# fdconsole.log localChanges, $('#history > p:first img').attr('src')

		callback localChanges, localContent

	saveDraft: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			@draftMessageOpen = true
			$('#release').attr 'disabled', 'disabled'
			callback false if callback
		else
			$('#release,#save-draft').attr 'disabled', 'disabled'
			message = $("#draft-message").val()
			content = @editor.exportFile().trim()
			filename = @viewParams.doc.filename
			slug = @viewParams.slug

			@services.documentManager.saveDraft slug, filename, content, message, =>
				$("#history p:first").text(' ' + message).prepend '<img src="img/draft-dot.png">'
				$('#draft-add-message').slideUp('fast')
				@draftMessageOpen = false
				$('#release').removeAttr 'disabled'
				callback true if callback
		return false

	release: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			$('#save-draft').attr 'disabled', 'disabled'
			@releaseMessage = true
			@draftMessageOpen = true
			callback false if callback
		else
			$('#release,#save-draft').attr 'disabled', 'disabled'
			message = $("#draft-message").val()
			content = @editor.exportFile().trim()
			filename = @viewParams.doc.filename
			slug = @viewParams.slug

			releaseFct = =>
				@services.documentManager.release slug, filename, content, message, =>
					$("#history").prepend('<p></p>').find('p:first').text(' ' + message).prepend '<img src="img/release-dot.png">'
					$('#draft-add-message').slideUp('fast')
					@draftMessageOpen = false
					@releaseMessage = false
					callback true if callback

			@checkLocalChanges (changes) =>
				if changes
					@services.documentManager.saveDraft slug, filename, content, message, =>
						$("#history p:first").text(' ' + message).prepend '<img src="img/draft-dot.png">'
						releaseFct()
				else
					releaseFct()

		@services.documentManager.getDocumentHistory @params.slug, (err, res) =>
			console.log release

	do: ->
		$('#document-panel').css('overflow', 'auto')
		selector = $('#epiceditor, #document-panel')
		resize = ->
			selector.height $(window).height() - 75

		resize()
		$(window).resize ->
			resize()
			@editor.reflow()

		@editor = new EpicEditor(
			localStorageName: @params.slug
			focusOnLoad: true
			basePath: '/lib/epiceditor'
			file:
				name: @params.slug
		).load =>
			if @viewParams.history[0]?.imgType == 'img/release-dot.png' and $('#history > p:first img').attr('src') != 'img/local-dot.png' or not @editor or @editor.exportFile().trim() == ''
				$('#save-draft').removeAttr('disabled')
			$("#save-draft").click =>
				@saveDraft()
				return false

			$("#release").click =>
				@release()
				return false

			$("#draft-message-go").click =>
				if @releaseMessage
					@release()
				else
					@saveDraft()

				return false

			$("#draft-message-cancel").click =>
				@draftMessageOpen = false
				$("#draft-add-message").slideUp('fast')
				$('#save-draft,#release').removeAttr('disabled')
				return false

		@editor.on 'update', =>
			@checkLocalChanges (localChanges, localContent) =>
				if localChanges and $('#history > p:first img').attr('src') != 'img/local-dot.png'
					$('#history').prepend '<p><img src="img/local-dot.png"> Local changes</p>'
					$('#save-draft,#release').removeAttr('disabled')

				else if not localChanges and $('#history > p:first img').attr('src') == 'img/local-dot.png'
					$('#history p:first').remove()
					$('#save-draft').attr('disabled', 'disabled')
				if not localChanges and (not @editor or @editor.exportFile().trim() == '')
					$('#save-draft').removeAttr('disabled')
