Contentify
==========

**Contentify** is a Collaborative content manager in realtime over Github and Github Pages.

This repository is a work in progress.

Available features
------------------

* Manage documents - Markdown and HTML support

* Editor with preview / fullscreen / syntax coloration etc...

* Real time edition with Github collaborators

* History of all your draft / release with diff

* Unlimited colaborators

* Easy integration with SDKs: Javascript, Node.js

* Simple interface

Installation over Github Pages
------------------------------

Fork this repository on your account. Then, to build the Github Pages, Github needs a push. To do it, you can simply change a file with the Github Interface or by using the console after having cloned the forked repository: `git push origin master`

Finally, go on http://[your-github-username].github.io/[your-github-repository] and start editing documents in Markdown or HTML in a simple editor.

Enable realtime with Firebase
-----------------------------

You can edit your documents in realtime with your Github collaborators by updating `config.js` with the option `firebase_url` set to your Firebase URL. To get one, you just have to signup on [Firebase](https://firebase.com).

    {
        ...
        firebase_url: 'xxxx-xxxx-xxxx.firebaseIO.com'
    }

That's it! You can start editing in realtime with your collaborators.

Installation over Github private pages
--------------------------------------

To install **contentify** over a Github **private** repository, you have to clone this repository with `--bare` option and push it with `--mirror` option on your private repository:

    git clone --bare https://github.com/thyb/contentify.git
    cd content.git
    git push --mirror https://github.com/LOGIN/REPO.git

Then, to prevent the Github Pages from being displayed to non collaborator users, go to https://github.com/LOGIN/REPO, and update `config.js` to put the option `private` set to `true`.

    var config = {
        ...
        private: true
    };

Local installation
------------------

### Install global dependancies (harp, grunt)

    (sudo) npm install -g harp grunt-cli

### Clone the repository and install local dependancies

    git clone git@github.com/thyb/contentify.git
    cd contentify/
    npm install

You have to update `config.js` to configure the runtime if you're hosting **contentify** locally.

e.g.

    var config = {
        username: 'thyb'
        repository: 'contentify'
    };

### Start the server

    grunt

Why ?
-----

My team and I at [OAuth.io](https://oauth.io) needed an efficient way for non-developer collaborators to work on the wording of the service without having to learn the HTML and Git/Github so I decided to make an easy way to work collaboratively with them. Now I can worry about the code and they can worry about the wording.

License
-------

APACHE2 LICENSE