DocHub
======

DocHub allow your non technical team to update static document and release them without to restart your server.

Installation
------------

Fork [this repository](https://github.com/thyb/hubdoc) on your account.

You can update `config.json` to configure the runtime of DocHub.

Enable Realtime
---------------

To enable realtime to GibHub, just create an account on Firebase and copy paste you keys in `config.json` in the `firebase` key. Once down, you'll see in realtime when a collaborator update a document or push a new one.

    {
        ...
        firebase: 'YOUR-KEY.firebaseio.com'
    }

Enable Search
-------------

You can also add a fast search bar using Algolia API. As for realtime with Firebase, to enable search, you just have to create an account on algolia.com and copy paste you keys in `config.json` in the `algolia` key. Once down, you'll be able to search in realtime in your document set.

    {
        ...
        algolia: "YOUR-API-KEY"
    }

License
-------

APACHE2 LICENSE