var Ctrl, LogoutCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = LogoutCtrl = (function(_super) {
  __extends(LogoutCtrl, _super);

  function LogoutCtrl(app) {
    LogoutCtrl.__super__.constructor.call(this, app);
    this.app.logout();
    this.app.redirect('/');
  }

  return LogoutCtrl;

})(Ctrl);
