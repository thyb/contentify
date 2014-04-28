Node.js SDK
===========

Installation
------------

The installation is easy using `npm`

`npm install contentify`

Then you can require contentify in your Node.js application

    var contentify = require('contentify')

Basic usage
-----------

Get the `readme.md` file

    contentify.getContent('readme.md', function(err, content) {
        //content is the html parsed from readme.md
    })
     
Get a fragment in `features.md`

    contentify.getContent('features.md', 'providers', function(err, content) {
        //content contains the html of the fragment providers of feature.md
    })
     
Get multiple fragments in features.md

    contentify.getContent('features.md', ['providers', 'sdk'], function(err, contents) {
        //contents is an array with the providers fragment and the sdk fragment
    })

In Express or Restify
---------------------

You can route your html file with contentify

    server.get(/^\/templates\/.*\.html/, content.serve({
        owner: 'thyb', /* the owner of the repo of contentify */
        repo: 'contentify', /* the repo of contentify */
        mode: 'draft', /* draft or release */
        directory: __dirname + '/app',
        //if private repository
        user: '',
        password: ''
    })

You can place `[[ include filename ]]` in your HTML template and this file will be automatically included from github. All files included are cached so if you need to clear the cache manually, use `contentify.clearCache(filename)` to clear the cache for a specific file or `contentify.clearCache()` to clear the whole cache.

You can have templates that look like this:

    <div class="col-lg-6">
        [[ include myfile.md#article1 ]]
    </div>
    <div class="col-lg-6">
        [[ include myfile.md#article2 ]]
    </div>

and myfile.md in Contentify looks like

    [[ fragment article1 ]]
     
    Article1
    ========
     
    Lorem ipsum ...
     
    [[ /fragment ]]
    [[ fragment article2 ]]
     
    Article2
    ========
     
    Lorem ipsum ...
     
    [[ /fragment ]]
    