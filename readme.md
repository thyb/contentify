Content
=======

This content manager allow your non technical team to update static document and release them without to restart your server.

Installation over Github Pages
------------------------------

Fork this repository on your account. Then, to build the Github Pages, Github need a push. To do it, you can simply change a file with the Github Interface or using the console after clonning the forked repository: `git push origin master`

Finally, go on http://[your-github-username].github.io/[your-github-repository] and start editing documents in Markdown or HTML in a simple editor.

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



License
-------

APACHE2 LICENSE