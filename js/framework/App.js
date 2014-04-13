var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager, User, config;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

User = require('./User');

config = require('../config');

module.exports = App = (function() {
  function App() {
    this.env = new Env();
    this.event = new GlobalEvent();
    this.ctrlManager = new CtrlManager(this);
    this.templateManager = TemplateManager;
    this.layoutManager = LayoutManager;
    this.ready = true;
    this.user = new User(this);
  }

  App.prototype.initializeRouter = function(setting) {
    this.router = new Router(this, setting);
    return this.router;
  };

  App.prototype.setLayout = function(layout) {
    this.ready = false;
    this.layoutManager.set(layout, (function(_this) {
      return function() {
        _this.router.setDefaultPlacement('#content');
        _this.ready = true;
        if (_this.started) {
          return _this.start();
        }
      };
    })(this));
    return this;
  };

  App.prototype.start = function() {
    var hash;
    this.started = true;
    if (this.ready) {
      this.user.initialize();
      hash = window.location.hash;
      console.log('router start', hash, this.router._state);
      if (hash && hash !== '#') {
        return this.redirect(hash.substr(1));
      } else if (!this.router._state) {
        return this.redirect('/');
      } else {
        return this.redirect(this.router._state);
      }
    }
  };

  App.prototype.askForRedirect = function(msg, answer) {
    this._askedForRedirect = true;
    this._askedForRedirectFct = answer;
    return $(window).bind('beforeunload', function() {
      return 'Your local changes might be lost';
    });
  };

  App.prototype.redirect = function(path) {
    var answer;
    console.log(this._askedForRedirect);
    if (this._askedForRedirect) {
      answer = this._askedForRedirectFct();
      console.log(answer);
      if (!answer || (answer && confirm('Are you sure you want to quit this page? all local changes will be lost.'))) {
        this._askedForRedirect = false;
        this._askedForRedirectFct = null;
        $(window).unbind('beforeunload');
        return this.router.stopPropagate(path).change(path);
      } else {
        this.router.nextNoRedirect = true;
        return this.router.changeHash(this.router._state);
      }
    } else if (!this._askedForRedirect) {
      return this.router.stopPropagate(path).change(path);
    }
  };

  App.prototype.refreshMenu = function(path) {
    console.log("refreshing menu", path, this.menu);
    if (!this.menu) {
      return false;
    }
    $('li.active', this.menu).removeClass('active');
    $('li a[href="#' + path + '"]').parent().addClass('active');
    if (!this.user.isAuth()) {
      $('li.need-auth').hide();
    }
    if (this.user.isAuth()) {
      return $('li.need-auth').show();
    }
  };

  App.prototype.setMenu = function(selector) {
    console.log("set menu selector", selector);
    this.menu = selector;
    return this;
  };

  App.prototype.setTitle = function(title) {};

  App.prototype.setMeta = function(meta, value) {};

  return App;

})();
