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
		if not title or not filename or filename == '.md'
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

		@repo.write 'config', 'documents.json', JSON.stringify(@root, null, 2), 'Create document ' + filename + ' in documents.json', (err) =>
			return callback err if err
			callback()

	createFolder: (name, callback) ->
		if @documents[name]
			return callback
				error: true
				code: 1
				msg: 'File / folder already exists, please choose another one'

		@documents[name] = {}
		debugger

		@repo.write 'config', 'documents.json', JSON.stringify(@root, null, 2), 'Create folder ' + name + ' in documents.json', (err) =>
			return callback err if err
			callback()

	release: (filename, content, message, callback) ->
		if not @filename then @parseFilename(filename)
		@documents[@filename].updated = Date.now()

		@repo.write 'config', 'documents.json', JSON.stringify(@root, null, 2), 'Update draft ' + filename, (err) =>
			return callback err if err
			@repo.write 'master', @filepath, content, message, callback

	saveDraft: (filename, content, message, callback) ->
		if not @filename then @parseFilename(filename)
		@documents[@filename].updated = Date.now()

		@repo.write 'config', 'documents.json', JSON.stringify(@root, null, 2), 'Update draft ' + filename, (err) =>
			return callback err if err
			@repo.write 'draft', @filepath, content, message, callback

	getDocument: (filename, callback) ->
		if not @filename then @parseFilename(filename)

		if Object.equal @documents, {}
			@repo.read 'config', 'documents.json', (err, data) =>
				@root = JSON.parse(data)
				doc = @root
				doc = doc[parent] for parent in @parents
				@documents = doc
				doc = @documents[@filename]

				@repo.read 'draft', @filepath, (err, content) =>
					content = '' if not content
					callback doc, content
		else
			callback @documents[filename]

	getReleaseHistory: (filename, callback) ->
		if not @filename then @parseFilename(filename)

		if not @documents[@filename]
			callback 'not found', null

		@repo.getCommits path: @filepath, sha: 'master', callback

	#getDraftHistory: () ->

	getDocumentHistory: (filename, callback) ->
		if not @filename then @parseFilename(filename)

		if not @documents[@filename]
			callback 'not found', null

		@repo.getCommits path: @filepath, sha: 'draft', callback

	mergeHistory: (releaseHistory, documentHistory) ->
		history = new Array()
		v.commit_type = 'release' for v in releaseHistory
		v.commit_type = 'draft' for v in documentHistory
		history = releaseHistory.add documentHistory
		history = history.sortBy ((elem) ->
			return new Date(elem.commit.author.date)
		), true

		return history

	parseFilename: (filename) ->
		@filepath = filename
		@parents = filename.split('/')
		@filename = @parents.pop()

	# WIP
	rename: (filename, newFilename, newName, callback) ->
		if not @filename then @parseFilename(filename)

		if not @documents[@filename]
			callback 'not found', null

		doc = @documents[@filename]
		if newFilename != @filename
			callback 'already exists', null if @documents[newFilename]

			@documents[newFilename] = doc
			@repo.move filename, newFilename
		# TODO save documents.json

	remove: (filename, callback) ->
		if not @filename then @parseFilename(filename)

		if not @documents[@filename]
			callback 'not found', null

		delete @documents[@filename]
		i = 0
		nbCall = 3
		@repo.write 'config', 'documents.json', JSON.stringify(@root, null, 2), 'Remove ' + @filepath, (err) =>
			callback(null, true) if callback and ++i == nbCall
		@repo.delete 'draft', @filepath, (err) =>
			callback(null, true) if callback and ++i == nbCall
		@repo.delete 'master', @filepath, (err) =>
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

	list: (foldername, callback) ->
		@parents = new Array()
		if foldername then @parents = foldername.split('/')

		@repo.read 'config', 'documents.json', (err, data) =>
			console.log err, data

			if not err
				@root = JSON.parse data
				sum = @root
				sum = sum[parent] for parent in @parents
				@documents = sum
			else
				@documents = {}

			list = new Array()

			for filename of @documents
				url = ((dup = @parents.slice(0)).push(filename) and dup).join('/')
				isFile = filename.match(/.*\.md$/)
				list.push $.extend({url, filename, isFile}, @documents[filename])

			callback err, list if callback
