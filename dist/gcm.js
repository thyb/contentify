(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ModalComponent;

module.exports = ModalComponent = (function() {
  function ModalComponent() {}

  ModalComponent.prototype.initialize = function() {
    return this.settings = {
      "extends": 'div',
      lifecycle: {
        created: function() {}
      },
      accessors: {
        title: {}
      }
    };
  };

  return ModalComponent;

})();

},{}],2:[function(require,module,exports){
module.exports = {
  repository: 'gcm',
  username: 'thyb'
};

},{}],3:[function(require,module,exports){
var AlwaysCtrl, Ctrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = AlwaysCtrl = (function(_super) {
  __extends(AlwaysCtrl, _super);

  function AlwaysCtrl() {
    return AlwaysCtrl.__super__.constructor.apply(this, arguments);
  }

  AlwaysCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  AlwaysCtrl.prototype["do"] = function() {};

  AlwaysCtrl.prototype.on = {
    "signin": function() {},
    "logout": function() {}
  };

  return AlwaysCtrl;

})(Ctrl);

},{"../framework/Ctrl":9}],4:[function(require,module,exports){
var Ctrl, DashboardCtrl, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

config = require('../config');

module.exports = DashboardCtrl = (function(_super) {
  __extends(DashboardCtrl, _super);

  function DashboardCtrl() {
    return DashboardCtrl.__super__.constructor.apply(this, arguments);
  }

  DashboardCtrl.prototype.initialize = function(callback) {
    var repo;
    repo = this.app.env.get('github').getRepo(config.username, config.repository);
    console.log(repo);
    return repo.read('master', 'documents.json', function(err, data) {
      if (err === 'not found') {
        if (callback) {
          return callback({
            documents: null
          });
        }
      }
      if (callback) {
        return callback({
          documents: data
        });
      }
    });
  };

  DashboardCtrl.prototype["do"] = function() {
    return $('#create-document').click((function(_this) {
      return function() {
        return _this.app.router.change('/documents/new');
      };
    })(this));
  };

  return DashboardCtrl;

})(Ctrl);

},{"../config":2,"../framework/Ctrl":9}],5:[function(require,module,exports){
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

},{"../framework/Ctrl":9}],6:[function(require,module,exports){
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
          _this.app.env.set('github', new Github({
            token: res.access_token,
            auth: 'oauth'
          }));
          _this.app.router.change('/documents');
          return _this.app.event.emit("signin");
        });
      };
    })(this));
  };

  return IndexCtrl;

})(Ctrl);

},{"../framework/Ctrl":9}],7:[function(require,module,exports){
var Ctrl, NewDocumentCtrl, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

config = require('../config');

module.exports = NewDocumentCtrl = (function(_super) {
  __extends(NewDocumentCtrl, _super);

  function NewDocumentCtrl() {
    return NewDocumentCtrl.__super__.constructor.apply(this, arguments);
  }

  NewDocumentCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  NewDocumentCtrl.prototype["do"] = function() {};

  return NewDocumentCtrl;

})(Ctrl);

},{"../config":2,"../framework/Ctrl":9}],8:[function(require,module,exports){
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

},{"./CtrlManager":11,"./Env":12,"./GlobalEvent":13,"./LayoutManager":14,"./Router":15,"./TemplateManager":16}],9:[function(require,module,exports){
var Ctrl, CtrlEvent, View;

CtrlEvent = require('./CtrlEvent');

View = require('./View');

module.exports = Ctrl = (function() {
  function Ctrl(app) {
    var ctrlname;
    this.app = app;
    ctrlname = this.constructor.name;
    ctrlname = ctrlname.substr(0, ctrlname.length - 4);
    ctrlname = ctrlname.replace(/([A-Z])/g, "-$1");
    this.templateUrl = ctrlname.substr(1).toLowerCase() + '.html';
    console.log(this.templateUrl);
    this.scope = {};
    this.event = new CtrlEvent();
    this.view = new View();
  }

  Ctrl.prototype.use = function(callback) {
    return this.render((function(_this) {
      return function() {
        return _this["do"](callback);
      };
    })(this));
  };

  Ctrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  Ctrl.prototype["do"] = function(callback) {
    if (callback) {
      return callback();
    }
  };

  Ctrl.prototype.render = function(callback) {
    return this.initialize((function(_this) {
      return function(params) {
        return _this.view.render(_this.templateUrl, params, _this.app.router.defaultPlacement, callback);
      };
    })(this));
  };

  return Ctrl;

})();

},{"./CtrlEvent":10,"./View":17}],10:[function(require,module,exports){
var CtrlEvent;

module.exports = CtrlEvent = (function() {
  function CtrlEvent() {
    this.listeners = [];
  }

  CtrlEvent.prototype.emit = function(name, value) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.name === name) {
        _results.push(listener.callback(value));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  CtrlEvent.prototype.receive = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return CtrlEvent;

})();

},{}],11:[function(require,module,exports){
var CtrlManager;

module.exports = CtrlManager = (function() {
  function CtrlManager(app) {
    this.app = app;
    this.partials = [];
  }

  CtrlManager.prototype.setMaster = function(ctrl, callback) {
    this.master = new ctrl(this.app);
    return this.master.use(callback);
  };

  CtrlManager.prototype.addPartial = function(ctrl, placement, callback) {
    this.partials.push({
      ctrl: new ctrl(this.app, {
        placement: placement
      })
    });
    return this.partials[this.partials.length - 1].ctrl.use(callback);
  };

  CtrlManager.prototype.removePartial = function(ctrl, placement) {
    var partial;
    for (partial in this.partials) {
      if (partials[partial].placement === placement) {
        delete partials[partial];
      }
    }
    return $(placement).html('');
  };

  return CtrlManager;

})();

},{}],12:[function(require,module,exports){
var Env;

module.exports = Env = (function() {
  function Env(data) {
    this.data = [];
    if ((data != null ? data.length : void 0) > 0) {
      this.data = data;
    }
  }

  Env.prototype.set = function(key, value) {
    return this.data[key] = value;
  };

  Env.prototype.get = function(key) {
    return this.data[key];
  };

  return Env;

})();

},{}],13:[function(require,module,exports){
var GlobalEvent;

module.exports = GlobalEvent = (function() {
  function GlobalEvent() {
    this.listeners = [];
  }

  GlobalEvent.prototype.emit = function(name, value) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.name === name) {
        _results.push(listener.callback(value));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  GlobalEvent.prototype.receive = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return GlobalEvent;

})();

},{}],14:[function(require,module,exports){
var LayoutManager;

module.exports = LayoutManager = (function() {
  var Layout, baseUrl, layout, layouts;

  function LayoutManager() {}

  layouts = {};

  layout = null;

  baseUrl = '/tmpl/layout/';

  Layout = (function() {
    function Layout(template) {
      this.template = template;
    }

    Layout.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template + '.html',
        type: "get"
      }).done((function(_this) {
        return function(content) {
          _this.content = content;
          if (callback) {
            return callback(content);
          }
        };
      })(this));
    };

    return Layout;

  })();

  LayoutManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  LayoutManager.set = function(l, callback) {
    layout = l;
    if (layouts[layout] == null) {
      layouts[layout] = new Layout(layout);
    }
    return layouts[layout].getContent((function(_this) {
      return function(content) {
        $('body').html(content);
        return callback();
      };
    })(this));
  };

  return LayoutManager;

})();

},{}],15:[function(require,module,exports){
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

},{"./View":17}],16:[function(require,module,exports){
var TemplateManager;

module.exports = TemplateManager = (function() {
  var Template, baseUrl, instances;

  function TemplateManager() {}

  instances = {};

  baseUrl = '/tmpl/main/';

  Template = (function() {
    function Template(template) {
      this.template = template;
    }

    Template.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template,
        type: "get"
      }).done(callback);
    };

    return Template;

  })();

  TemplateManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  TemplateManager.get = function(template, callback) {
    if (instances[template] == null) {
      instances[template] = new Template(template);
    }
    return instances[template].getContent(callback);
  };

  return TemplateManager;

})();

},{}],17:[function(require,module,exports){
var TemplateManager, View;

TemplateManager = require('./TemplateManager');

module.exports = View = (function() {
  function View() {}

  View.prototype.render = function(templateUrl, params, placement, success) {
    return TemplateManager.get(templateUrl, function(content) {
      var template;
      template = Handlebars.compile(content);
      $(placement).html(template(params));
      if (success) {
        return success();
      }
    });
  };

  return View;

})();

},{"./TemplateManager":16}],18:[function(require,module,exports){

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
var AlwaysCtrl, App, DashboardCtrl, ErrorCtrl, IndexCtrl, ModalComponent, NewDocumentCtrl;

App = require('./framework/App');

AlwaysCtrl = require('./controllers/AlwaysCtrl');

ErrorCtrl = require('./controllers/ErrorCtrl');

IndexCtrl = require('./controllers/IndexCtrl');

DashboardCtrl = require('./controllers/DashboardCtrl');

NewDocumentCtrl = require('./controllers/NewDocumentCtrl');

ModalComponent = require('./components/containers/ModalComponent');

$('document').ready(function() {
  var app;
  app = new App();
  app.initializeRouter({
    'always': AlwaysCtrl,
    '/': IndexCtrl,
    '/404': ErrorCtrl,
    '/documents': {
      ctrl: DashboardCtrl,
      partials: [
        {
          '/new': {
            ctrl: NewDocumentCtrl,
            container: ModalComponent
          }
        }
      ]
    }
  });
  return app.setLayout('index').start();
});

},{"./components/containers/ModalComponent":1,"./controllers/AlwaysCtrl":3,"./controllers/DashboardCtrl":4,"./controllers/ErrorCtrl":5,"./controllers/IndexCtrl":6,"./controllers/NewDocumentCtrl":7,"./framework/App":8}]},{},[18])