var Router, View;

View = require('./View');

module.exports = Router = (function() {
  function Router(app, setup) {
    this.app = app;
    this._routes = setup;
    this.changingHash = false;
    this.defaultPlacement = 'body';
    $(window).hashchange((function(_this) {
      return function() {
        if (_this.nextNoRedirect) {
          return _this.nextNoRedirect = false;
        } else {
          return _this.app.redirect(window.location.hash.substr(1));
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

  Router.prototype._checkPath = function(path) {
    var masterCtrl, masterParams, param, params, regexpStr, res, route;
    masterParams = {};
    for (route in this._routes) {
      if (route.indexOf('/:') !== -1) {
        res = route.match(/\/:([a-zA-Z0-9]+)/);
        res.shift();
        params = res;
        regexpStr = route.replace(/\/:[a-zA-Z0-9]+/g, '/([a-zA-Z0-9_\\-\\./]+)').replace(/\//g, '\\/');
        res = path.match(new RegExp(regexpStr));
        if (!res) {
          continue;
        }
        res.shift();
        for (param in params) {
          if (param === 'index' || param === 'input') {
            continue;
          }
          masterParams[params[param]] = res[param];
        }
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
      } else if (route === path) {
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
        break;
      }
    }
    masterParams['path'] = path;
    return {
      master: masterCtrl,
      masterParams: masterParams,
      partial: null
    };
  };

  Router.prototype.stopPropagate = function(path) {
    this.stop = path;
    return this;
  };

  Router.prototype.change = function(path) {
    var res;
    res = this._checkPath(path);
    if (!res.master) {
      return this.change('/404');
    }
    this.changeHash(path);
    this.app.ctrlManager.setMaster(res.master, res.masterParams, (function(_this) {
      return function() {
        if (_this.stop) {
          _this.stop = false;
        }
        return _this.app.refreshMenu(path);
      };
    })(this));
    return this;
  };

  return Router;

})();
