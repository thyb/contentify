module.exports = class TemplateManager
	instances = {}
	baseUrl = '/tmpl/main/'

	class Template
		constructor: (@template) ->
		getContent: (callback)->
			return callback @content if @content
			$.ajax(
				url: baseUrl + @template,
				type: "get"
			).done callback

	@setBaseUrl: (base) ->
		baseUrl = base

	@get: (template, callback) ->
		instances[template] ?= new Template(template)
		instances[template].getContent callback