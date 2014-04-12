var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager, User;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

User = require('./User');

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

  App.prototype.redirect = function(path) {
    console.log('redirect', path);
    return this.router.stopPropagate(path).change(path);
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
