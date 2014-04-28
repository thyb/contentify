Service = require('../framework/Service')

module.exports = class DocumentManagerService extends Service
	constructor: (@github)->
		@documents = {}

		href = window.location.href
		res = href.match /^http:\/\/([a-zA-Z0-9_-]+).github.io\/([a-zA-Z0-9_-]+)\/.*$/i
		if not res
			@repo = @github.getRepo config.username, config.repository
		else
			@repo = @github.getRepo res[1], res[2]

	checkAccess: (username, callback) ->
		@repo.isCollaborator username, (err, res) ->
			if res
				return callback 'collaborator'
			else
				if config.private
					return callback false
				else
					return callback 'guest'

	create: (filename, title, callback) ->
		if not title or not filename
			return callback
				error: true
				code: 4
				msg: 'Filename and title required'

		if @documents[filename]
			return callback
				error: true
				code: 1
				msg: 'File already exists, please choose another one'


		if title.length > 70
			return callback
				error: true
				code: 3
				msg: 'Title too long'

		if not filename.match /^[a-zA-Z0-9-_.\/]+$/i
			return callback
				error: true
				code: 2
				msg: 'The filename should contains alphanumeric characters with `-` or `_` or `.`'

		@documents[filename] =
			name: title
			created: Date.now()
			path: ''

		@repo.write 'config', 'documents.json', JSON.stringify(@documents, null, 2), 'Create document ' + filename + ' in documents.json', (err) =>
			return callback err if err
			callback()

	release: (filename, content, message, callback) ->
		@documents[filename].updated = Date.now()
		@repo.write 'config', 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + filename, (err) =>
			return callback err if err
			@repo.write 'master', filename, content, message, callback

	saveDraft: (filename, content, message, callback) ->
		@documents[filename].updated = Date.now()
		@repo.write 'config', 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + filename, (err) =>
			return callback err if err
			@repo.write 'draft', filename, content, message, callback

	getDocument: (filename, callback) ->
		if Object.equal @documents, {}
			@repo.read 'config', 'documents.json', (err, data) =>
				@documents = JSON.parse(data)
				doc = @documents[filename]
				@repo.read 'draft', filename, (err, content) =>
					content = '' if not content
					callback doc, content
		else
			callback @documents[filename]

	getReleaseHistory: (filename, callback) ->
		if not @documents[filename]
			callback 'not found', null

		@repo.getCommits path: filename, sha: 'master', callback

	#getDraftHistory: () ->

	getDocumentHistory: (filename, callback) ->
		if not @documents[filename]
			callback 'not found', null

		@repo.getCommits path: filename, sha: 'draft', callback

	mergeHistory: (releaseHistory, documentHistory) ->
		history = new Array()
		v.commit_type = 'release' for v in releaseHistory
		v.commit_type = 'draft' for v in documentHistory
		history = releaseHistory.add documentHistory
		history = history.sortBy ((elem) ->
			return new Date(elem.commit.author.date)
		), true

		return history

	# WIP
	rename: (filename, newFilename, newName, callback) ->
		if not @documents[filename]
			callback 'not found', null

		doc = @documents[filename]
		if newFilename != filename
			callback 'already exists', null if @documents[newFilename]

			@documents[newFilename] = doc
			@repo.move filename, newFilename
		# TODO save documents.json

	remove: (filename, callback) ->
		if not @documents[filename]
			callback 'not found', null

		delete @documents[filename]
		i = 0
		nbCall = 3
		@repo.write 'config', 'documents.json', JSON.stringify(@documents, null, 2), 'Remove ' + filename, (err) =>
			callback(null, true) if callback and ++i == nbCall
		@repo.delete 'draft', filename, (err) =>
			callback(null, true) if callback and ++i == nbCall
		@repo.delete 'master', filename, (err) =>
			callback(null, true) if callback and ++i == nbCall

	getCommit: (sha, cb) ->
		cb 'sha needed' if not sha
		@repo.getCommit sha, (err, commit) =>
			return cb err if err
			@repo.getBlob commit.files[0].sha, (err, data) =>
			# $.get commit.files[0].raw_url, (data) =>
				return cb err if err
				commit.raw = data
				cb null, commit

	list: (callback) ->
		@repo.read 'config', 'documents.json', (err, data) =>
			console.log err, data
			if not err
				@documents = JSON.parse data
			else
				@documents = {}
			list = new Array()
			for filename of @documents
				list.push $.extend(filename: filename, @documents[filename])

			callback err, list if callback
