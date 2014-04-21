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
		$('#exit-fullscreen').remove()

	initialize: (callback) ->
		@services.documentManager.checkAccess @app.user.get('login'), (access) =>
			return @app.redirect '/403' if not access
			@access = access
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
		localContent = @editor.getValue()
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
			callback false if callback
		else
			message = $("#draft-message").val()
			content = @editor.getValue()
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
			content = @editor.getValue()
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
		$('#document-panel, #preview, #diff').css('overflow-y', 'auto')
		selector = $('#document-panel')
		editorSel = $('#editor,#diff')
		previewSel = $('#preview')

		resize = =>
			selector.height $(window).height() - 75
			editorSel.height $(window).height() - 105
			previewSel.height $(window).height() - 125

		resize()
		$(window).bind 'resize', =>
			resize()
			@editor.resize()

	syncScroll: () ->
		scroll = (src, editorScrollT) =>
			return false if $('#editor').css('display') == 'none' or $('#preview').css('display') == 'none'
			editorH = $('#editor').height()
			previewH = $('#preview').outerHeight()

			previewScrollT = $('#preview')[0].scrollTop

			editorScrollH = @editor.getSession().getScreenLength() * 16
			previewScrollH = $('#preview')[0].scrollHeight

			editorScrollH = 0 if editorScrollH < 0
			previewScrollH = 0 if previewScrollH < 0

			ratioPreview = previewScrollT / (previewScrollH - previewH)
			ratioEditor = editorScrollT / (editorScrollH - editorH)
			ratioEditor2 = editorH / editorScrollH

			if src == 'editor'
				$('#preview')[0].scrollTop = ratioEditor * (previewScrollH - previewH)
			else
				@editor.getSession().setScrollTop ratioPreview * (editorScrollH - editorH)

		@editor.getSession().on 'changeScrollTop', (scrollTop) =>
			scroll 'editor', scrollTop
		$('#preview').scroll => scroll 'preview'

	patchPrettyPrint: (patch) ->
		if not patch
			return $('#diff').html '<p class="alert alert-info">No diff with last version</p>'
		lines = patch.split '\n'
		diff = []
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
						content: '@' + line
					regexp = /^@ \-([0-9]+)(,[0-9]+)? \+([0-9]+)(,[0-9]+)? @@.*$/i
					res = line.match regexp
					lineCounter[0] = res[1]
					lineCounter[1] = (if res[2] and res[2].substr(0, 1) is "," then res[3] else res[2])

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
				$('#version, #toolbar-versionning').hide()
				t = 'preview'
				if $('#editor-mode').hasClass 'btn-inverse'
					if $('#editor').parent().hasClass 'firepad'
						$('#editor').parent().show()
					t = 'editor'

				$('#' + t + ', #toolbar-editor').show()
				@editor.resize()
			else
				@services.documentManager.getCommit item.sha, (err, commit) =>
					patch = commit.files[0].patch
					@patchPrettyPrint patch

					$('#raw-diff').html commit.raw
					$('#preview-diff').html marked(commit.raw)
					$('#editor, #toolbar-editor, #preview').hide()
					if $('#editor').parent().hasClass 'firepad'
						$('#editor').parent().hide()

					$('#version, #toolbar-versionning').show()

		$('#revert').click =>
			if confirm('Are you sure you want revert to this version? You can undo with `cmd + z`.')
				content = $('#raw-diff').html()
				@editor.setValue content
				@history.change 0
				@editor.clearSelection()
				@editor.focus()
				@editor.navigateFileStart()

		$('#preview-version-mode').click =>
			$('#preview-diff').show()
			$('#diff, #raw-diff').hide()
			$('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass 'btn-inverse'
			$('#preview-version-mode').removeClass('btn-default').addClass 'btn-inverse'

		$('#diff-mode').click =>
			$('#diff').show()
			$('#preview-diff, #raw-diff').hide()
			$('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass 'btn-inverse'
			$('#diff-mode').removeClass('btn-default').addClass 'btn-inverse'

		$('#raw-mode').click =>
			$('#raw-diff').show()
			$('#diff, #preview-diff').hide()

			$('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass 'btn-inverse'
			$('#raw-mode').removeClass('btn-default').addClass 'btn-inverse'

	updatePreview: ->
		previewContent = @editor.getValue()
		if @viewParams.doc.extension == 'md'
			previewContent = marked(previewContent)
		$('#preview').html previewContent

	setupTheme: ->
		editor = @editor
		app = @app
		list = [
			'github'
			'monokai'
			'terminal'
			'tomorrow'
			'tomorrow_night'
			'tomorrow_night_bright'
			'tomorrow_night_eighties'
			'twilight'
			'xcode'
		]

		selectTheme = (theme) =>
			$.getScript 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/theme-' + theme + '.js', =>
				editor.setTheme 'ace/theme/' + theme
				app.env.set 'theme', theme
				$('#theme').find('span.name').text theme.titleize()


		menu = $('#theme').parent().find('ul')

		list.forEach (item) =>
			menu.append('<li id="' + item + '"><a href="#">' + item.titleize() + '</a></li>')

		def = 'twilight'
		theme = @app.env.get 'theme'
		if not theme
			theme = def
		selectTheme theme

		$('li a', menu).click (e) ->
			item = $(@).parent().attr('id')
			selectTheme item
			$('#theme').dropdown('toggle')
			return false

	fullscreenMode: ->
		$('#editor,#preview').show()
		$('#editor').css
			position: 'fixed'
			left: 0
			top: '51px'
			height: ($(window).height() - 51) + 'px'
			width: '50%'
		if $('#editor').parent().hasClass('firepad')
			$('#editor').parent().show()
		$('#preview').css
			position: 'fixed'
			left: '50%'
			top: '51px'
			height: ($(window).height() - 51) + 'px'
			width: '50%'
			backgroundColor: 'white'
			zIndex: 10

		@editor.resize()
		$('body').append('<button id="exit-fullscreen" class="btn btn-default">Exit fullscreen</button>')
		$('#exit-fullscreen').click =>
			$('#editor').css
				position: 'relative'
				left: 'auto'
				top: 'auto'
				height: ($(window).height() - 106) + 'px'
				width: 'auto'
				display: (if $('#editor-mode').hasClass('btn-inverse') then 'block' else 'none')

			if $('#editor').parent().hasClass('firepad') and $('#editor').css('display') == 'none'
				$('#editor').parent().hide()

			$('#preview').css
				position: 'static'
				left: 'auto'
				top: 'auto'
				height: ($(window).height() - 125) + 'px'
				width: 'auto'
				display: (if $('#preview-mode').hasClass('btn-inverse') then 'block' else 'none')

			@editor.resize()
			$('#exit-fullscreen').remove()

	do: ->
		@app.askForRedirect 'Your local changes might be lost', =>
			return @checkLocalChanges()

		@autoResizeEditor()

		@editor = ace.edit 'editor'

		@editor.getSession().setUseWrapMode true

		if @viewParams.doc.extension == 'md'
			@editor.getSession().setMode "ace/mode/markdown"
		else
			@editor.getSession().setMode "ace/mode/html"

		@setupTheme()

		$('#preview-mode').click =>
			$('#editor-mode').removeClass('btn-inverse').addClass 'btn-default'
			$('#preview-mode').addClass('btn-inverse').removeClass 'btn-default'
			$('#editor').hide()
			if $('#editor').parent().hasClass 'firepad'
				$('#editor').parent().hide()
			$('#preview').show()
			$('#theme').parent().hide()

		$('#editor-mode').click =>
			$('#preview-mode').removeClass('btn-inverse').addClass 'btn-default'
			$('#editor-mode').addClass('btn-inverse').removeClass 'btn-default'
			$('#preview').hide()
			$('#editor').show()
			if $('#editor').parent().hasClass 'firepad'
				$('#editor').parent().show()
			$('#theme').parent().show()

		$('#fullscreen-mode').click =>
			@fullscreenMode()

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

		$('#fork').click =>
			alert 'work in progress'

		@setupHistory()

		if @access == 'collaborator' and config.firebase_url and config.firebase_url != ''
			$('#editor').append '<div id="loader-editor">
			<div class="teardrop tearLeft"></div>
			<div class="teardrop tearRight"></div>
			<div id="contain1">
				<div id="ball-holder1">
					<div class="ballSettings ball1"></div>
				</div>
			</div>
			<div id="contain2">
				<div id="ball-holder2">
					<div class="ballSettings ball2"></div>
				</div>
			</div>
		</div>'
			@firepadRef = new Firebase('https://' + config.firebase_url + '/firepad/' + @viewParams.slug)
			@firepad = Firepad.fromACE @firepadRef, @editor

			@firepad.on 'ready', =>
				$('#loader-editor').remove()
				text = @firepad.getText()
				if text == ''
					@firepad.setText @viewParams.lastContent
		else
			@editor.setValue @viewParams.lastContent
			@editor.clearSelection()
			@editor.focus()
			@editor.navigateFileStart()
			if @access == 'guest'
				@editor.setReadOnly true
				$("#save-draft,#release").hide()
				$('#fork,#read-only').show()

		@syncScroll()
		@updatePreview()
		@editor.on 'paste', (input) =>
			setTimeout (=>
				content = @editor.getValue()
				if content.match /[’“”]/g # if copy/paste from google drive...
					content = content.replace(/\’/g, '\'').replace(/[“”]/g, '"').replace(/…/g, '...')
					cur = @editor.selection.getCursor()
					@editor.setValue content
					@editor.clearSelection()
					@editor.selection.moveCursorToPosition cur
					@editor.scrollToLine cur.row, true, false, =>
			), 100

		@editor.getSession().on 'change', =>
			content = @editor.getValue()
			localChanges = @viewParams.lastContentHash != MD5 content

			@updatePreview()
			@history.setLocalChanges localChanges
