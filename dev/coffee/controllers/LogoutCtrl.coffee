Ctrl = require('../framework/Ctrl')

module.exports = class LogoutCtrl extends Ctrl
	constructor: (app)->
		super(app)
		@app.logout()
		@app.redirect '/'