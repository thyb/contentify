Service = require('../framework/Service')
config = require('../../config')

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

	create: (params, callback) ->

		if @documents[params.slug]
			return callback
				error: true,
				code: 1
				msg: 'Slug already exists, please choose another one'

		if params.extension != 'md' and params.extension != 'html'
			return callback
				error: true,
				code: 2
				msg: 'Unknown extension'

		if params.name.length > 70
			return callback
				error: true,
				code: 3
				msg: 'Name too long'

		@documents[params.slug] =
			name: params.name
			extension: params.extension
			created: Date.now()
			path: ''
			filename: params.slug + '.' + params.extension

		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Create document ' + params.slug + ' in documents.json', (err) =>
			return callback err if err
			@repo.branch params.slug, (err) ->
				return callback err if err
				callback()

	release: (slug, filename, content, message, callback) ->
		@documents[slug].updated = Date.now()
		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + slug, (err) =>
			return callback err if err
			@repo.write 'master', filename, content, message, callback

	saveDraft: (slug, filename, content, message, callback) ->
		@documents[slug].updated = Date.now()
		@repo.write slug, 'documents.json', JSON.stringify(@documents, null, 2), 'Update draft ' + slug, (err) =>
			return callback err if err
			@repo.write slug, filename, content, message, callback

	getDocument: (slug, callback) ->
		if Object.equal @documents, {}
			@repo.read 'master', 'documents.json', (err, data) =>
				@documents = JSON.parse(data)
				doc = @documents[slug]
				@repo.read slug, doc.filename, (err, content) =>
					content = '' if not content
					callback doc, content
		else
			callback @documents[slug]

	getReleaseHistory: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		@repo.getCommits path: @documents[slug].filename, sha: 'master', callback

	#getDraftHistory: () ->

	getDocumentHistory: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		@repo.getCommits path: @documents[slug].filename, sha: slug, callback

	mergeHistory: (releaseHistory, documentHistory) ->
		history = new Array()
		v.commit_type = 'release' for v in releaseHistory
		v.commit_type = 'draft' for v in documentHistory
		history = releaseHistory.add documentHistory
		history = history.sortBy ((elem) ->
			return new Date(elem.commit.author.date)
		), true

		return history

	remove: (slug, callback) ->
		if not @documents[slug]
			callback 'not found', null

		filename = @documents[slug].filename
		delete @documents[slug]
		i = 0
		@repo.deleteRef 'heads/' + slug, (err) =>
			callback(null, true) if callback and ++i == 3
		@repo.write 'master', 'documents.json', JSON.stringify(@documents, null, 2), 'Remove ' + slug, (err) =>
			callback(null, true) if callback and ++i == 3
		@repo.delete 'master', filename, (err) =>
			callback(null, true) if callback and ++i == 3

	getCommit: (sha, cb) ->
		@repo.getCommit sha, cb if sha

	list: (callback) ->
		@repo.read 'master', 'documents.json', (err, data) =>
			if not err
				@documents = JSON.parse data
			else
				@documents = {}
			list = new Array()
			for slug of @documents
				list.push $.extend(slug: slug, @documents[slug])

			callback err, list if callback
