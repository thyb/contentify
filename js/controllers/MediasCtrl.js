var Ctrl, MediasCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = MediasCtrl = (function(_super) {
  __extends(MediasCtrl, _super);

  function MediasCtrl(app) {
    MediasCtrl.__super__.constructor.call(this, app);
  }

  MediasCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  MediasCtrl.prototype["do"] = function() {};

  return MediasCtrl;

})(Ctrl);
