var Ctrl, CtrlEvent, View;

CtrlEvent = require('./CtrlEvent');

View = require('./View');

module.exports = Ctrl = (function() {
  function Ctrl(app, params) {
    var ctrlname;
    this.app = app;
    this.params = params;
    ctrlname = this.constructor.name;
    ctrlname = ctrlname.substr(0, ctrlname.length - 4);
    ctrlname = ctrlname.replace(/([A-Z])/g, "-$1");
    this.templateUrl = ctrlname.substr(1).toLowerCase() + '.html';
    console.log(this.templateUrl);
    this.scope = {};
    this.event = new CtrlEvent();
    this.view = new View();
    this.services = {};
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
