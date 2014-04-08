var Ctrl, ErrorCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports(ErrorCtrl = (function(_super) {
  __extends(ErrorCtrl, _super);

  function ErrorCtrl() {
    return ErrorCtrl.__super__.constructor.apply(this, arguments);
  }

  ErrorCtrl.prototype["do"] = function() {};

  return ErrorCtrl;

})(Ctrl));
