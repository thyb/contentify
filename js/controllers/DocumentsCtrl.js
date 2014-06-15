var Ctrl, DocumentManagerService, DocumentsCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentsCtrl = (function(_super) {
  __extends(DocumentsCtrl, _super);

  function DocumentsCtrl(app, params) {
    DocumentsCtrl.__super__.constructor.call(this, app, params);
    if (!this.app.user.isAuth()) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.user.github);
  }

  DocumentsCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.checkAccess(this.app.user.get('login'), (function(_this) {
      return function(access) {
        if (!access) {
          return _this.app.redirect('/403');
        }
        _this.access = access;
        return _this.services.documentManager.list(_this.params.foldername, function(err, data) {
          if (err === 'not found') {
            return _this.app.redirect('/404');
          }
          _this.app.documents = data;
          if (callback) {
            return callback({
              documents: data,
              documentsPath: _this.services.documentManager.getCurrentPath()
            });
          }
        });
      };
    })(this));
  };

  DocumentsCtrl.prototype["do"] = function() {
    if (this.access === 'guest') {
      $("#create-document").hide();
      $('#read-only').show();
    }
    $('#create-document').click(function() {
      return $('#new-document-modal').modal('show');
    });
    $('#create-folder').click(function() {
      return $('#new-folder-modal').modal('show');
    });
    $('#new-document-modal .create-button').click((function(_this) {
      return function() {
        var formData;
        formData = {
          title: $('#name-input').val(),
          filename: $('#filename-input').val() + '.md'
        };
        return _this.services.documentManager.create(formData.filename, formData.title, function(err) {
          if (err) {
            if (!err.msg) {
              err.msg = JSON.stringify(err);
            }
            $('#new-document-modal form .alert').html(err.msg).removeClass('hide');
            return false;
          }
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
          if (_this.params.foldername) {
            return _this.app.redirect('/document/' + _this.params.foldername + '/' + formData.filename);
          } else {
            return _this.app.redirect('/document/' + formData.filename);
          }
        });
      };
    })(this));
    return $('#new-folder-modal .create-button').click((function(_this) {
      return function() {
        var formData;
        formData = {
          name: $('#new-folder-modal .name-input').val()
        };
        return _this.services.documentManager.createFolder(formData.name, function(err) {
          if (err) {
            if (!err.msg) {
              err.msg = JSON.stringify(err);
            }
            $('#new-document-modal form .alert').html(err.msg).removeClass('hide');
            return false;
          }
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
          if (_this.params.foldername) {
            return _this.app.redirect('/documents/' + _this.params.foldername + '/' + formData.name);
          } else {
            return _this.app.redirect('/documents/' + formData.name);
          }
        });
      };
    })(this));
  };

  return DocumentsCtrl;

})(Ctrl);
