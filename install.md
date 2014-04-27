Installation
============

Installation on a Github public repository
------------------------------------------

Fork this repository on your account. Then, to build the Github Pages, Github need a push. To do it, you can simply change a file with the Github Interface or using the console after clonning the forked repository: `git push origin master`

Finally, go on http://[your-github-username].github.io/[your-github-repository] and start editing documents in Markdown or HTML in a simple editor.

Enable realtime with Firebase
-----------------------------

You can edit in realtime your documents with your Github collaborators by updating `config.js` with the option `firebase_url` set to your Firebase URL. To get one, you just have to signup on [Firebase](https://firebase.com).

    {
        ...
        firebase_url: 'xxxx-xxxx-xxxx.firebaseIO.com'
    }

That's it! You can start editing in realtime with your collaborators.

Installation on a Github private repository
-------------------------------------------

To install **contentify** over a Github **private** repository, you have to clone this repository with `--bare` option and push it with `--mirror` option on your private repository:

    git clone --bare https://github.com/thyb/contentify.git
    cd content.git
    git push --mirror https://github.com/YOUR-LOGIN/YOUR-REPO.git

Then, to disable the Github Pages to be displayed by non collaborator users, Go in https://github.com/LOGIN/REPO, and update `config.js` to put the option `private` set to `true`.

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
