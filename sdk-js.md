Javascript SDK
==============

Dependancies
------------

* jQuery >1.5
* marked ~0.3.2

Installation
------------

The installation is easy using `bower`

`bower install contentify`

Then you need to include the script in your web page

    <script src="/bower_components/contentify/dist/contentify.js" type="text/javascript"></script>

Usage
-----

Initialize **contentify** using:

    contentify.intialize(login, repo)
    // eg. contentify.initialize('thyb', 'contentify')

### Using the jQuery plugin

    $('#content').includeContent(filename[, fragment], callback)
    
`filename` is the file you want to include inside `#content`
`fragment` is an optional string. (see Fragment chapter)
`callback` is called when the file is loaded and parsed in HTML

eg

load a file

    $('#content').includeContent('readme.md')
     
load a file with fragment

    $('#content2').includeContent('features.md', 'providers')

load a file with callback

    $('#content3').includeContent('readme.md', function(elem) {
        // todo when content is loaded
    })
     
load a file with fragment and callback

    $('#content4').includeContent('features.md', 'providers', function(elem) {
        // todo when the content is loaded
    })
    
### Without the jQuery plugin

    contentify.getContent(filename[, fragment], callback)

`filename` is the file you want to include inside `#content`
`fragment` is an optional string. (see Fragment chapter)
`callback` is called when the file is loaded and parsed in HTML

eg

    contentify.getContent('readme.md', function(err, content) {
        //todo with `content`
    })

Fragment
--------

A fragment is defined in your markdown file with this syntax:

    [[ fragment name ]]
     
    content
     
    [[ /fragment ]]
    
eg in myfile.md

    [[ fragment summary ]]
     
    ...
     
    [[ /fragment ]]

Then, in your javascript, you can specify that you just want this part of the document.

    $('#content2').includeContent('myfile.md', 'summary')