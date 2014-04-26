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
LearnMoreCtrl = require('./controllers/LearnMoreCtrl')

$('document').ready ->
	OAuth.initialize 'poZr5pdrx7yFDfoE-gICayo2cBc'

	app = new App()

	app.initializeRouter
		'/document/:slug': DocumentCtrl
		'/': IndexCtrl
		'/learn-more': LearnMoreCtrl
		'/learn-more/:doc': LearnMoreCtrl
		'/404': ErrorCtrl
		'/403': ErrorCtrl
		'/documents': DocumentsCtrl
		'/medias': MediasCtrl
		'/logout': LogoutCtrl

	app.event.on 'login', ->
		$('#user-menu').prepend '<li id="user-avatar" class="auth-needed"><a href="https://github.com/' + app.user.get('login') + '"><img style="margin-top: -15px; position: relative; top: 6px" width="32" src="' + app.user.get('avatar_url') + '" class="img-circle"></a></li>'

	app.event.on 'logout', ->
		$('#user-avatar').remove()

	app.setMenu('#menu').setLayout('index').start()
