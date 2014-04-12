###
class GDraft
	construct: (slug, commit) ->
	push: (content, commit) ->
	diff: (commit) ->

class GDocument
	construct: (slug, options) ->
	getContent: ->
	getMeta: ->
	createDraft: ->

documentManager =
	documents: [],
	createOrOpen: (slug, options) ->
		#git branch document-{slug} if not exists
		#git checkout document-{slug}
		#
	diff: (slug, v1, v2) ->
	list: ->

repo =
	construct: ->
###
App = require('./framework/App')
AlwaysCtrl = require('./controllers/AlwaysCtrl')
ErrorCtrl = require('./controllers/ErrorCtrl')
IndexCtrl = require('./controllers/IndexCtrl')
DocumentsCtrl = require('./controllers/DocumentsCtrl')
DocumentCtrl = require('./controllers/DocumentCtrl')
MediasCtrl = require('./controllers/MediasCtrl')
LogoutCtrl = require('./controllers/LogoutCtrl')

$('document').ready ->
	OAuth.initialize 'poZr5pdrx7yFDfoE-gICayo2cBc'

	app = new App()

	app.initializeRouter
		'/document/:slug': DocumentCtrl
		'/': IndexCtrl
		'/404': ErrorCtrl
		'/documents': DocumentsCtrl
		'/medias': MediasCtrl
		'/logout': LogoutCtrl

	app.setMenu('#menu').setLayout('index').start()
