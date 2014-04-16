module.exports = class DocumentHistory
	constructor: (initialHistory, me)->
		@me = me
		@current = 0
		@history = []
		@listeners = {}

		for hist in initialHistory
			@history.push
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
			@container.find('p.active').removeClass 'active'
			@container.find('p:eq(' + @current.toString() + ')').addClass 'active'

	on: (e, callback) ->
		@listeners[e] = [] if not @listeners[e]
		@listeners[e].push callback

	renderElement: (index, init) ->
		init = false if not init
		elem = @history[index]

		if init
			@container.append @template(elem)
		else if index == 0
			@container.prepend @template(elem)
		else
			@container.find('p:eq(' + index.toString() + ')').html @template(elem)

		selector = @container.find('p:eq(' + index.toString() + ')')
		if index == @current
			@container.find('p.active').removeClass 'active'
			selector.addClass 'active'

		selector.click =>
			if not selector.hasClass('active')
				ind = selector.index()
				@change ind
				@listeners['select'].each (fct) =>
					fct @history[ind], ind

	change: (index) ->
		@current = index
		@container.find('p.active').removeClass 'active'
		@container.find('p:eq(' + index.toString() + ')').addClass 'active'

	render: (@container) ->
		@container.html('')

		for i of @history
			@renderElement parseInt(i), true

	generateTemplate: ->
		content = '<p>
	<img width="42" height="42" title="{{login}}" class="img-circle {{version_type}}" src="{{avatar_url}}">
	<span class="msg">{{message}}</span>
</p>'
		@template = Handlebars.compile content
