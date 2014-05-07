Overview
========

**Contentify** is a realtime collaborative content manager on top of Github and Github Pages.

Available features
------------------

* Manage documents in Markdown
 
* Editor with preview / fullscreen / syntax coloration etc...

* Realtime editing with Github collaborators

* History of all your drafts / releases with diff

* Unlimited colaborators

* Easy integration with SDKs: Javascript, Node.js

* Simple interface

Installation
------------

The full management system is a Github Pages site that you can host on any Github repository. Just fork the repo [thyb/contentify](https://github.com/thyb/contentify), push something to generate the Github page, and you are done. 

[Read more about the installation process](#/learn-more/install)

Manage your content
-------------------

![Screenshot](http://thyb.github.io/contentify/img/contentify-screen.png)

1- Now your content can be edited easily by your non-technical team in a realtime collaboration. The edition can be in Markdown as well as in HTML directly (personally, i recommend Markdown).

2- You have an editor with a preview of what you and your collaborators are writing in realtime, as you would do on Google Drive.

3- You can save your changes as a Draft or as a Release. The production only sees the releases, while your development team can hook on the draft saves.

4- You can go in the history to review old versions (with their changes) and rollback to a specific version if necessary.

5- You can cut your document in fragments for a smoother integration.

Integrate your content in your apps
-----------------------------------

**With Javascript**

    contentify.initialize('thyb', 'contentify')
     
    $('#content').includeContent('readme.md')

[Learn more about the Javascript SDK](http://thyb.github.io/contentify/#/learn-more/sdk-js)

**With Node.js**

    contentify = require('contentify')
     
    contentify.initialize('thyb', 'contentify')
     
    contentify.getContent('readme.md', function(err, content) {
        //content is a string containing the parsed HTML of `readme.md`
    })

[Learn more about the Node.js SDK](http://thyb.github.io/contentify/#/learn-more/sdk-node)
