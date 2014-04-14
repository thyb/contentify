module.exports = class DocumentHistory
	constructor: (initialHistory, me)->
		@me = me
		@current = 0
		@history = []
		for hist in initialHistory
			@history.unshift
				sha: hist.sha
				version_type: hist.commit_type
				message: hist.commit.message
				login: hist.author.login
				avatar_url: hist.author.avatar_url
		@generateTemplate()

	add: (hist) ->
		@history.unshift
			sha: hist.sha
			version_type: hist.commit_type
			message: hist.commit.message
			login: hist.author.login
			avatar_url: hist.author.avatar_url

		if @current != 0
			@current++

		@renderElement 0

	setLocalChanges: (state) ->
		if state
			return false if @history[0]?.version_type == 'local'
			@history.unshift
				version_type: 'local'
				message: 'Local changes'
				login: @me.get 'login'
				avatar_url: @me.get 'avatar_url'

			if @current != 0
				@current++

			@renderElement 0
		else
			return false if not @history[0] or @history[0]?.version_type != 'local'
			@history.shift()
			@container.find('p:first').remove()

	on: (event, callback) ->
		if event == 'select'
			callback()

	renderElement: (index) ->
		elem = @history[index]

		@container.prepend(@template(elem))

		if index == @current
			@container.find('p.active').removeClass 'active'
			@container.find('p:eq(' + index + ')').addClass 'active'

	render: (@container) ->
		@container.html('')
		for i of @history
			@renderElement i

	generateTemplate: ->
		content = '<p><img width="42" height="42" title="{{login}}" class="img-circle {{version_type}}" src="{{avatar_url}}"><span>{{message}}</span></p>'
		@template = Handlebars.compile content
