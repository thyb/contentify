var Router, View;

View = require('./View');

module.exports = Router = (function() {
  function Router(app, setup) {
    this.app = app;
    this._routes = setup;
    this.changingHash = false;
    this.defaultPlacement = 'body';
    $(window).on('hashchange', (function(_this) {
      return function() {
        if (!_this.changingHash) {
          return _this.change(window.location.hash.substr(1));
        } else {
          return _this.changingHash = false;
        }
      };
    })(this));
  }

  Router.prototype.setDefaultPlacement = function(defaultPlacement) {
    this.defaultPlacement = defaultPlacement;
    return this;
  };

  Router.prototype.changeHash = function(path) {
    this._state = path;
    this.changingHash = true;
    return window.location.hash = this._state;
  };

  Router.prototype.change = function(path) {
    var masterCtrl, partial, partialObj, route, routePartial, _i, _len, _ref;
    for (route in this._routes) {
      if (route === path) {
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
        break;
      }
      if (route === path.substr(0, route.length && path.substr(route.length, 1 === '/' && this._routes[route].ctrl && this._routes[route].partials))) {
        partial = path.substr(route.length);
        masterCtrl = this._routes[route].ctrl;
        _ref = this.routes[route].partials;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          routePartial = _ref[_i];
          if (routePartial === partial) {
            partialObj = routePartial;
            break;
          }
        }
      }
    }
    if (!masterCtrl) {
      this.change('/404');
    }
    this.changeHash(path);
    this.app.ctrlManager.setMaster(masterCtrl, (function(_this) {
      return function() {
        if (partialObj) {
          return _this.app.ctrlManager.addPartial(partialObj.ctrl, partialObj.container);
        }
      };
    })(this));
    return this;
  };

  return Router;

})();
