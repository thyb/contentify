Ctrl = require('../framework/Ctrl')

module.exports = class LearnMoreCtrl extends Ctrl
	availableDocument: ['overview', 'install', 'faq', 'sdk-js', 'sdk-node', 'faq', 'about']
	do: ->
		contentify.initialize 'thyb', 'contentify', 'draft'

		doc = 'overview'
		doc = @params.doc if @params.doc and @params.doc in @availableDocument
		$('#menu-' + doc).addClass 'active'
		$('#learn-content').includeContent doc + '.md', (elem) ->
			elem.find('img').addClass 'img-responsive'
			elem.find('pre').each (i,e) ->
				hljs.highlightBlock(e)
