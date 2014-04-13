module.exports = class LayoutManager
	layouts = {}
	layout = null
	baseUrl = 'tmpl/layout/'

	class Layout
		constructor: (@template) ->
		getContent: (callback)->
			return callback @content if @content
			$.ajax(
				url: baseUrl + @template + '.html',
				type: "get"
			).done (content) =>
				@content = content
				callback(content) if callback

	@setBaseUrl: (base) ->
		baseUrl = base

	@set: (l, callback) ->
		layout = l
		layouts[layout] ?= new Layout(layout)
		layouts[layout].getContent (content) =>
			$('body').html content
			callback()
