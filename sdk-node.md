Node.js SDK
===========

Installation
------------

`npm install contentify`

Basic usage
-----------

    contentify = require('contentify')
     
    //Get `readme.md` file
    contentify.getContent('readme.md', function(err, content) {
        //content is the html parsed from readme.md
    })
     
    //Get a fragment in `features.md`
    contentify.getContent('features.md', 'providers', function(err, content) {
        //`content` contains the html of the fragment `providers` of feature.md
    })
     
    //Get multiple fragments in features.md
    contentify.getContent('features.md', ['providers', 'sdk'], function(err, contents) {
        //`contents` is an array with the `providers` fragment and the `sdk` fragment
    })

In Express or Restify
---------------------

	server.get(/^\/templates\/.*\.html/, content.serve({
		owner: 'thyb', //the owner of the repo of contentify
		repo: 'contentify', //the repo of contentify
		mode: 'draft', //draft or release
		directory: __dirname + '/app',
		//if private repository
		user: '',
		password: ''
    })
