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

		console.log 'check changes', hashToCompare, localContentHash
		return false if not hashToCompare

		if localContentHash != hashToCompare
			localChanges = true

		console.log localChanges
		return localChanges

	saveDraft: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			@draftMessageOpen = true
			callback false if callback
		else
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
				callback true if callback
		return false

	release: (callback) ->
		if not @draftMessageOpen
			$('#draft-add-message').slideDown('fast')
			@releaseMessage = true
			@draftMessageOpen = true
			callback false if callback
		else
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

	remove: (callback) ->
		slug = @viewParams.slug
		@services.documentManager.remove slug, =>
			@app.askForRedirect false
			@app.redirect '/documents'

	autoResizeEditor: () ->
		$('#document-panel, #diff').css('overflow-y', 'auto')
		selector = $('#epiceditor, #diff, #document-panel')

		resize = =>
			selector.height $(window).height() - 75

		resize()
		$(window).bind 'resize', =>
			resize()
			@editor.reflow()

	patchPrettyPrint: (patch) ->
		lines = patch.split '\n'
		diff = []
		console.log "start prettyprint", lines
		lineCounter = [1, 1]
		for index of lines
			line = lines[index].substr 1
			type = lines[index].substr 0, 1

			switch type
				when '@'
					diff.push
						cssClass: 'active'
						line1: ''
						line2: ''
						content: line
					regexp = /^@ \-([0-9]+),[0-9]+ \+([0-9]+),[0-9]+ @@.*$/i
					res = line.match regexp
					lineCounter[0] = res[1]
					lineCounter[1] = res[2]

				when ' '
					diff.push
						cssClass: ''
						line1: lineCounter[0]++
						line2: lineCounter[1]++
						content: line

				when '+'
					diff.push
						cssClass: 'success'
						line1: lineCounter[0]++
						line2: ''
						content: line

				when '-'
					diff.push
						cssClass: 'danger'
						line1: ''
						line2: lineCounter[1]++
						content: line

		templateContent = '<table class="table table-responsive table-condensed">
	{{#each lines}}
	<tr class={{cssClass}}>
		<td class="line" style="color:">{{line1}}</td>
		<td class="line">{{line2}}</td>
		<td class="content"><pre>{{content}}</pre></td>
	</tr>
	{{/each}}
</table>'

		template = Handlebars.compile templateContent
		$('#diff').html template(lines: diff)

		#comment
		#addition
		#deletion
		#normal

	setupHistory: () ->
		@history = new DocumentHistory(@viewParams.history, @app.user, @editor)
		@history.render $('#history')
		@history.on 'select', (item, index) =>
			if index == 0
				$('#diff').hide()
				$('#epiceditor').show()
				@editor.reflow()
			else
				@services.documentManager.getCommit item.sha, (err, commit) =>
					patch = commit.files[0].patch
					@patchPrettyPrint patch
					$('#epiceditor').hide()
					$('#diff').show()
					console.log err, commit

	do: ->
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

		@setupHistory()
		@editor.importFile @params.slug, @viewParams.lastContent

		@editor.on 'update', (local) =>
			localChanges = @viewParams.lastContentHash != MD5 local.content

			@history.setLocalChanges localChanges
