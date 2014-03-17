app =
	state: "/"
	github: null
	auth: false

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

view =
	render: (template, params, placement) ->
		if not placement
			placement = params
			params = {}

		$.get template, params, (data) ->
			template = Handlebars.compile data
			$('body').html(template())

$('document').ready ->
	OAuth.initialize 'poZr5pdrx7yFDfoE-gICayo2cBc'
	$('button').click ->
		OAuth.popup 'github', (err, res) ->
			return console.log err if err
			console.log res
			app.github = new Github token: res.access_token, auth: 'oauth'
			view.render '/tmpl/main/dashboard.html', 'body'
