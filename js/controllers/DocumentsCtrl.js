var Ctrl, DocumentManagerService, DocumentsCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentsCtrl = (function(_super) {
  __extends(DocumentsCtrl, _super);

  function DocumentsCtrl(app) {
    DocumentsCtrl.__super__.constructor.call(this, app);
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
        return _this.services.documentManager.list(function(err, data) {
          if (err === 'not found') {
            if (callback) {
              return callback({
                documents: null
              });
            }
          }
          _this.app.documents = data;
          if (callback) {
            return callback({
              documents: data
            });
          }
        });
      };
    })(this));
  };

  DocumentsCtrl.prototype["do"] = function() {
    $('#create-document').click(function() {
      return $('#new-document-modal').modal('show');
    });
    $('#name-input').keyup(function() {
      return $('#slug-input').val($(this).val().dasherize());
    });
    return $('#create-button').click((function(_this) {
      return function() {
        var formData, type;
        type = $('#new-document-modal .btn-group label.active').text().trim().toLowerCase();
        if (type === 'markdown') {
          type = 'md';
        }
        formData = {
          name: $('#name-input').val(),
          slug: $('#slug-input').val(),
          extension: type
        };
        return _this.services.documentManager.create(formData, function(err) {
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
          return _this.app.redirect('/document/' + formData.slug);
        });
      };
    })(this));
  };

  return DocumentsCtrl;

})(Ctrl);
