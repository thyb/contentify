TemplateManager = require('./TemplateManager')

module.exports = class View
	render: (templateUrl, params, placement, success) ->
		TemplateManager.get templateUrl, (content) ->
			template = Handlebars.compile content
			$(placement).html(template(params))
			success() if success