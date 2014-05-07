FAQ
===

What is Contentify?
-------------------

**Contentify** is a content manager with a realtime collaboration on top of Github.

That means your non technical collaborators can now focus on and change the content/wording of your website without needing the technical collaborators to do so. The latter can continue to take care of the design / code.

How does it work?
-----------------

It's just a Github Pages site hosted on your repository that allow you to manage all your content in a simple way.

**Contentify** uses:

* OAuth.io - to connect users easily with Github

* Github.js - to use the Github API

* Ace editor - to edit Markdown and HTML

* Firebase and Firepad - to collaborate in realtime

* Github - to store your content and manage it

Is it easy to install?
----------------------

YES! You just have to fork the repository [thyb/contentify](https://github.com/thyb/contentify) and push anything to regenerate the Github Pages:

```sh
$ git push origin master
```

If you want more information, go to the [install guide](http://thyb.github.io/contentify/#/learn-more/install)

Is it free?
-----------

Yes. **Contentify** is completely free.

However, as contentify is built on top of other technology, they may ask you to pay for:

* A private content repository ([Github](https://github.com/pricing))
* More than 50 connexion in realtime ([Firebase](https://firebase.com/pricing))

How integrate the content in my app?
------------------------------------

With JavaScript (browser), use the [JavaScript SDK](https://github.com/thyb/contentify-js). It's a jQuery plugin which eases the way you include content.

    contentify.initialize('thyb','contentify')
    $('#content').includeContent('readme.md')

With Node.js, use the [Node.js SDK](https://github.com/thyb/contentify-js).

    var contentify = require('contentify')
    contentify.initialize('thyb', 'contentify')
    contentify.getContent('readme.md', function(err, content) {
        //todo with content
    })

If you need to integrate it in another technology, you can use the REST API of Github

    GET https://api.github.com/repos/thyb/contentify/contents/readme.md?ref=master
    Accept: application/vnd.github.V3.raw

