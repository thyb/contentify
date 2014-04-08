Ctrl = require('../framework/Ctrl')

module.exports = class IndexCtrl extends Ctrl
	do: ->
		OAuth.initialize 'poZr5pdrx7yFDfoE-gICayo2cBc'
		$('button').click =>
			OAuth.popup 'github', (err, res) =>
				return console.log err if err
				@app.env.set 'github', new Github token: res.access_token, auth: 'oauth'
				@app.router.change '/documents'
				@app.event.emit "signin"
