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
DashboardCtrl = require('./controllers/DashboardCtrl')
DocumentCtrl = require('./controllers/DocumentCtrl')

$('document').ready ->
	app = new App()

	app.initializeRouter
		'/document/:slug': DocumentCtrl
		'/': IndexCtrl
		'/404': ErrorCtrl
		'/documents': DashboardCtrl

	accessToken = app.env.get 'access_token'
	console.log accessToken
	if accessToken
		app.github = new Github(token: accessToken, auth: 'oauth')

	app.setLayout('index').start()
