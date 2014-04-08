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
