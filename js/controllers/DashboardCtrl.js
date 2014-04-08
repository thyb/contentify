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
