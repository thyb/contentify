(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AlwaysCtrl, Ctrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = AlwaysCtrl = (function(_super) {
  __extends(AlwaysCtrl, _super);

  function AlwaysCtrl() {
    return AlwaysCtrl.__super__.constructor.apply(this, arguments);
  }

  AlwaysCtrl.prototype["do"] = function() {};

  return AlwaysCtrl;

})(Ctrl);

},{"../framework/Ctrl":6}],2:[function(require,module,exports){
var Ctrl, DashboardCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = DashboardCtrl = (function(_super) {
  __extends(DashboardCtrl, _super);

  function DashboardCtrl() {
    return DashboardCtrl.__super__.constructor.apply(this, arguments);
  }

  DashboardCtrl.prototype["do"] = function() {
    return alert("ok");
  };

  return DashboardCtrl;

})(Ctrl);

},{"../framework/Ctrl":6}],3:[function(require,module,exports){
var Ctrl, ErrorCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = ErrorCtrl = (function(_super) {
  __extends(ErrorCtrl, _super);

  function ErrorCtrl() {
    return ErrorCtrl.__super__.constructor.apply(this, arguments);
  }

  ErrorCtrl.prototype["do"] = function() {};

  return ErrorCtrl;

})(Ctrl);

},{"../framework/Ctrl":6}],4:[function(require,module,exports){
var Ctrl, IndexCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = IndexCtrl = (function(_super) {
  __extends(IndexCtrl, _super);

  function IndexCtrl() {
    return IndexCtrl.__super__.constructor.apply(this, arguments);
  }

  IndexCtrl.prototype["do"] = function() {
    OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
    return $('button').click((function(_this) {
      return function() {
        return OAuth.popup('github', function(err, res) {
          if (err) {
            return console.log(err);
          }
          console.log(res);
          _this.app.github = new Github({
            token: res.access_token,
            auth: 'oauth'
          });
          return _this.app.router.change('/dashboard');
        });
      };
    })(this));
  };

  return IndexCtrl;

})(Ctrl);

},{"../framework/Ctrl":6}],5:[function(require,module,exports){
var App, Router;

Router = require('./Router');

module.exports = App = (function() {
  function App() {}

  App.prototype.initializeRouter = function(setting) {
    this.router = new Router(this, setting);
    return this.router;
  };

  return App;

})();

},{"./Router":7}],6:[function(require,module,exports){
var Ctrl;

module.exports = Ctrl = (function() {
  function Ctrl(app, routeInfo) {
    this.app = app;
    this.routeInfo = routeInfo;
    this.scope = {};
  }

  return Ctrl;

})();

},{}],7:[function(require,module,exports){
var Router, View;

View = require('./View');

module.exports = Router = (function() {
  function Router(app, setup) {
    this.app = app;
    this._routes = setup;
  }

  Router.prototype.baseTemplate = function(base) {
    this.base = base;
  };

  Router.prototype.change = function(path) {
    var route, routeInfo, view;
    for (route in this._routes) {
      if (route === path) {
        routeInfo = this._routes[route];
        break;
      }
    }
    this._state = path;
    if (!routeInfo) {
      this._state = '/404';
      routeInfo = this._routes['/404'];
    }
    if (!routeInfo.placement) {
      routeInfo.placement = 'body';
    }
    view = new View();
    return view.render(this.base + routeInfo.view, {}, routeInfo.placement, (function(_this) {
      return function() {
        var controller;
        controller = new routeInfo.ctrl(_this.app, routeInfo);
        return controller["do"]();
      };
    })(this));
  };

  return Router;

})();

},{"./View":8}],8:[function(require,module,exports){
var View;

module.exports = View = (function() {
  function View() {}

  View.prototype.render = function(template, params, placement, success) {
    return $.get(template, params, function(data) {
      template = Handlebars.compile(data);
      $('body').html(template());
      if (success) {
        return success();
      }
    });
  };

  return View;

})();

},{}],9:[function(require,module,exports){

/*
class GDraft
	construct: (slug, commit) ->
	push: (content, commit) ->
	diff: (commit) ->

class GDocument
	construct: (slug, options) ->
	getContent: ->
	getMeta: ->
	createDraft: ->

documentManager =
	documents: [],
	createOrOpen: (slug, options) ->
		 *git branch document-{slug} if not exists
		 *git checkout document-{slug}
		 *
	diff: (slug, v1, v2) ->
	list: ->

repo =
	construct: ->
 */
var AlwaysCtrl, App, DashboardCtrl, ErrorCtrl, IndexCtrl;

App = require('./framework/App');

AlwaysCtrl = require('./controllers/AlwaysCtrl');

ErrorCtrl = require('./controllers/ErrorCtrl');

IndexCtrl = require('./controllers/IndexCtrl');

DashboardCtrl = require('./controllers/DashboardCtrl');

$('document').ready(function() {
  var app, router;
  app = new App();
  router = app.initializeRouter({
    'always': {
      ctrl: AlwaysCtrl
    },
    '/': {
      view: 'index.html',
      ctrl: IndexCtrl
    },
    '/404': {
      view: '404.html',
      ctrl: ErrorCtrl
    },
    '/dashboard': {
      view: 'dashboard.html',
      ctrl: DashboardCtrl
    }
  });
  router.baseTemplate('/tmpl/main/');
  return router.change('/');
});

},{"./controllers/AlwaysCtrl":1,"./controllers/DashboardCtrl":2,"./controllers/ErrorCtrl":3,"./controllers/IndexCtrl":4,"./framework/App":5}]},{},[9])