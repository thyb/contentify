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
