Content
=======

This content manager allow your non technical team to update static document and release them without to restart your server.

Feature
-------

* Manage documents - Markdown and HTML support
* Editor with preview / fullscreen / syntax coloration etc...
* Real time edition with Github collaborators
* History of all your draft / release with diff
* Unlimited colaborators
* Simple interface

Installation over Github Pages
------------------------------

Fork this repository on your account. Then, to build the Github Pages, Github need a push. To do it, you can simply change a file with the Github Interface or using the console after clonning the forked repository: `git push origin master`

Finally, go on http://[your-github-username].github.io/[your-github-repository] and start editing documents in Markdown or HTML in a simple editor.

Installation over Github private pages
--------------------------------------

To install `content` over a Github **private** repository, you have to clone this repository with `--bare` option and push it with `--mirror` option on your private repository:

    git clone --bare https://github.com/thyb/content.git
    cd content.git
    git push --mirror https://github.com/LOGIN/REPO.git

Then, to disable the Github Pages to be displayed by non collaborator users, Go in https://github.com/LOGIN/REPO, and update config.js to put the option `private` set to `true`.

    module.exports = {
        ...
        private: true
    }

Local installation
------------------

### Install global dependancies (harp, grunt)

    (sudo) npm install -g harp grunt-cli

### Clone the repository and install local dependancies

    git clone git@github.com/thyb/content.git
    cd content/
    npm install

You have to update `dev/coffee/config.coffee` to configure the runtime of DocHub if you're hosting it locally.

e.g.

    module.exports =
        username: 'thyb'
        repository: 'content'

### Start the server

    grunt

Enable realtime with Firebase
-----------------------------

You can edit with your Github collaborators easily by updating `config.js` and `firebase_url` set to your Firebase URL. To get one, just signup on [Firebase](https://firebase.com).

    {
        ...
        firebase_url: 'xxxx-xxxx-xxxx.firebaseIO.com'
    }

That's it! You can start editing in realtime with your collaborators.

License
-------

APACHE2 LICENSE