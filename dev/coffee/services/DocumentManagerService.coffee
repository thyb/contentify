Service = require('../framework/Service')
DocumentService = require('./DocumentService')

class DocumentManagerService extends Service
	documents: [],
	createOrOpen: (slug, options) ->
		#git branch document-{slug} if not exists
		#git checkout document-{slug}
		#
	diff: (slug, v1, v2) ->
	list: ->
		