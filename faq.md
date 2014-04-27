FAQ
===

What is Contentify?
-------------------

**Contentify** is a content manager with a realtime collaboration over Github.

That means your non technical collaborators can now update the content/wording of your website while the technical collaborators continue to take care of the design / code.

How it works?
-------------

It's just a Github pages hosted on your repository that can manage all your content in a simple way.

**Contentify** use:

* OAuth.io - to connect users easily with Github

* Github.js - to use the Github API

* Ace editor - to edit Markdown and HTML

* Firebase and Firepad - to collaborate in realtime

* Github - to store your content and manage it

Is it easy to install?
----------------------

YES! You just have to fork the repository [thyb/contentify](https://github.com/thyb/contentify) and push something to regenerate the Github Pages.

If you want more information, go to the [install guide](http://thyb.github.io/contentify/#/learn-more/install)

Is it free?
-----------

Yes. **Contentify** is fully free.

As contentify is built on top of other technology, they may ask you to pay for:

* private content repository ([Github](https://github.com/pricing))
* More than 50 connexion in realtime ([Firebase](https://firebase.com/pricing))

How integrate the content in my app?
------------------------------------

With Javascript (browser), use the [Javascript SDK](https://github.com/thyb/contentify-js). It's a jQuery plugin which ease the way you include content.

    contentify.initialize('thyb','contentify')
    $('#content').includeContent('readme.md')

With Node.js, use the [Node.js SDK](https://github.com/thyb/contentify-js).

    var contentify = require('contentify')
    contentify.initialize('thyb', 'contentify')
    contentify.getContent('readme.md', function(err, content) {
        //todo with content
    })

If you need to integrate it in another techno, you can use the REST API of Github

    GET https://api.github.com/repos/thyb/contentify/contents/readme.md?ref=master
    Accept: application/vnd.github.V3.raw

