var Ctrl, IndexCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = IndexCtrl = (function(_super) {
  __extends(IndexCtrl, _super);

  function IndexCtrl(app) {
    IndexCtrl.__super__.constructor.call(this, app);
    if (this.app.auth) {
      this.app.redirect('/documents');
    }
  }

  IndexCtrl.prototype["do"] = function() {
    OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
    return $('button').click((function(_this) {
      return function() {
        return OAuth.popup('github', function(err, res) {
          if (err) {
            return console.log(err);
          }
          _this.app.login(res.access_token, 'github');
          return _this.app.redirect('/documents');
        });
      };
    })(this));
  };

  return IndexCtrl;

})(Ctrl);
