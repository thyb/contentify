var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

module.exports = App = (function() {
  function App() {
    this.env = new Env();
    this.event = new GlobalEvent();
    this.ctrlManager = new CtrlManager(this);
    this.templateManager = TemplateManager;
    this.layoutManager = LayoutManager;
    this.ready = true;
  }

  App.prototype.initializeRouter = function(setting) {
    this.router = new Router(this, setting);
    return this.router;
  };

  App.prototype.setLayout = function(layout) {
    this.ready = false;
    this.layoutManager.set(layout, (function(_this) {
      return function() {
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
      if (hash && (hash !== '#' || hash !== '#/')) {
        return this.router.change(hash);
      } else if (!this.router._state) {
        return this.router.change('/');
      } else {
        return this.router.change(this.router._state);
      }
    }
  };

  App.prototype.include = function(ctrl, placement) {
    return this.ctrlManager.addPartial(ctrl, placement);
  };

  App.prototype.setTitle = function(title) {};

  App.prototype.setMeta = function(meta, value) {};

  return App;

})();
