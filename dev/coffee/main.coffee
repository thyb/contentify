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
NewDocumentCtrl = require('./controllers/NewDocumentCtrl')
ModalComponent = require('./components/containers/ModalComponent')

$('document').ready ->
	app = new App()

	app.initializeRouter(
		'always': AlwaysCtrl
		'/': IndexCtrl
		'/404': ErrorCtrl
		'/documents':
			ctrl: DashboardCtrl
			partials: [
				'/new':
					ctrl: NewDocumentCtrl
					container: ModalComponent
			]
	)

	app.setLayout('index').start()