module.exports = class ModalComponent
	initialize: ->
		@settings =
			extends: 'div',
			lifecycle:
				created: ->
			accessors:
				title: {}