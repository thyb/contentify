Ctrl = require('../framework/Ctrl')
DocumentManagerService = require('../services/DocumentManagerService')
DocumentHistory = require('../components/DocumentHistory')

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

	unload: () ->
		super()
		$(window).unbind 'resize'
		try
			@editor.unload()

	initialize: (callback) ->
		@services.documentManager.getDocument @params.slug, (doc, lastContent) =>
			@app.redirect '/documents' if not doc
			@services.documentManager.getDocumentHistory @params.slug, (err, documentHistory) =>
				@services.documentManager.getReleaseHistory @params.slug, (err, releaseHistory) =>
					localContent = lastContent
					lastContentHash = MD5 lastContent
					localChanges = false

					merge = @services.documentManager.mergeHistory(releaseHistory, documentHistory)
					@history = new DocumentHistory(merge, @app.user)
					@viewParams =
						doc: doc
						slug: @params.slug
						diff: documentHistory
						history: merge
						localChanges: localChanges
						lastContent: lastContent
						lastContentHash: lastContentHash

					callback @viewParams if callback

	checkLocalChanges: (hashToCompare) ->
		localContent = $('#editor-content').val()
		localContentHash = MD5 localContent
		localChanges = false
		hashToCompare = @viewParams.lastContentHash if not hashToCompare
		return false if not hashToCompare

		if localContentHash != hashToCompare
			localChanges = true


		return localChanges

	saveDraft: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			@draftMessageOpen = true
			# $('#release').attr 'disabled', 'disabled'
			callback false if callback
		else
			# $('#release,#save-draft').attr 'disabled', 'disabled'
			message = $("#draft-message").val()
			content = @editor.exportFile()
			filename = @viewParams.doc.filename
			slug = @viewParams.slug

			@services.documentManager.saveDraft slug, filename, content, message, (err, res) =>
				@viewParams.lastContent = content
				@viewParams.lastContentHash = MD5 content

				@services.documentManager.getCommit res.commit.sha, (err, lastCommit) =>
					@history.setLocalChanges false
					lastCommit.commit_type = 'draft'
					@history.add lastCommit
				$('#draft-add-message').slideUp('fast')
				@draftMessageOpen = false
				# $('#release').removeAttr 'disabled'
				callback true if callback
		return false

	release: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			# $('#save-draft').attr 'disabled', 'disabled'
			@releaseMessage = true
			@draftMessageOpen = true
			callback false if callback
		else
			#$('#release,#save-draft').attr 'disabled', 'disabled'
			message = $("#draft-message").val()
			content = @editor.exportFile()
			filename = @viewParams.doc.filename
			slug = @viewParams.slug

			releaseFct = =>
				@services.documentManager.release slug, filename, content, message, (err, res) =>
					@viewParams.lastContent = content
					@viewParams.lastContentHash = MD5 content
					@services.documentManager.getCommit res.commit.sha, (err, lastCommit) =>
						@history.setLocalChanges false
						lastCommit.commit_type = 'release'
						@history.add lastCommit
					$('#draft-add-message').slideUp('fast')
					@draftMessageOpen = false
					@releaseMessage = false
					callback true if callback

			changes = @checkLocalChanges()
			if changes
				@services.documentManager.saveDraft slug, filename, content, message, (err, res) =>
					@viewParams.lastContent = content
					@viewParams.lastContentHash = MD5 content
					@services.documentManager.getCommit res.commit.sha, (err, lastCommit) =>
						@history.setLocalChanges false
						lastCommit.commit_type = 'draft'
						@history.add lastCommit
					releaseFct()
			else
				releaseFct()

		#@services.documentManager.getDocumentHistory @params.slug, (err, res) =>
		#	console.log release

	remove: (callback) ->
		slug = @viewParams.slug
		@services.documentManager.remove slug, =>
			@app.askForRedirect false
			@app.redirect '/documents'

	autoResizeEditor: () ->
		$('#document-panel').css('overflow-y', 'auto')
		selector = $('#epiceditor, #document-panel')

		resize = =>
			selector.height $(window).height() - 75

		resize()
		$(window).bind 'resize', =>
			resize()
			@editor.reflow()

	do: ->
		@history.render $('#history')
		@app.askForRedirect 'Your local changes might be lost', =>
			return @checkLocalChanges()

		@autoResizeEditor()

		editorOptions =
			textarea: 'editor-content'
			focusOnLoad: true
			basePath: './lib/epiceditor',
			file:
				name: @params.slug

		if @viewParams.doc.extension == 'html'
			editorOptions.parser = false

		@editor = new EpicEditor(editorOptions).load =>
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
				return false

			$('#remove-doc-link').click =>
				if confirm "Are you sure you want to remove this document?"
					@remove()
				return false

			$('#rename-doc-link').click =>
				return false

		@editor.remove @params.slug
		@editor.importFile @params.slug, @viewParams.lastContent

		@editor.on 'update', (local) =>
			localChanges = @viewParams.lastContentHash != MD5 local.content

			@history.setLocalChanges localChanges
			#if localChanges and $('#history > p:first img').attr('src') != 'img/local-dot.png'
			#	$('#history').prepend '<p><img src="img/local-dot.png"> Local changes</p>'
			#	$('#save-draft,#release').removeAttr('disabled')

			#else if not localChanges and $('#history > p:first img').attr('src') == 'img/local-dot.png'
			#	$('#history p:first').remove()
			#	$('#save-draft').attr('disabled', 'disabled')
			#if not localChanges and (not @editor or local.content.trim() == '')
			#	$('#save-draft').removeAttr('disabled')
