Overview
========

**Contentify** is a manageable content manager in realtime over Github.

Installation
------------

The full management system is a Github Pages you can host and any repository on Github. Just fork the repo [thyb/contentify](https://github.com/thyb/contentify) and you are done. 

[Read more about the installation process](#/learn-more/install)

Manage your content
-------------------

![Screenshot](http://thyb.github.io/contentify/img/contentify-screen.png)

1- Now your content can be edited easily by non-technical team in a realtime collaboration. The edition is in Markdownor in HTML directly (personally, i recommend Markdown).

2- You have an editor with preview of what your writing and collaborate in realtime as you do on Google Drive.

3- You can save your change as a Draft or as a Release. The production see only the release saves while your development team can hook on the draft saves.

4- Go in the history to review old version (with their changes) and rollback to a specific version if necessary.

5- You can cut your document in fragment for a smoother integration

Integrate your content in your apps
-----------------------------------

**With Javascript**

    contentify.initialize('thyb', 'contentify')
     
    $('#content').includeContent('readme.md')

[Learn more about the Javascript SDK]

**With Node.js**

    contentify = require('contentify')
     
    contentify.initialize('thyb', 'contentify')
     
    contentify.getContent('readme.md', function(err, content) {
        //content is a string containing the parsed HTML of `readme.md`
    })

