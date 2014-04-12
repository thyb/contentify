var Ctrl, DocumentManagerService, DocumentsCtrl, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

config = require('../config');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentsCtrl = (function(_super) {
  __extends(DocumentsCtrl, _super);

  function DocumentsCtrl(app) {
    DocumentsCtrl.__super__.constructor.call(this, app);
    console.log("construct dashboard");
    if (!this.app.auth) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.github);
  }

  DocumentsCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.list((function(_this) {
      return function(err, data) {
        if (err === 'not found') {
          if (callback) {
            return callback({
              documents: null
            });
          }
        }
        console.log("list", data);
        _this.app.documents = data;
        if (callback) {
          return callback({
            documents: data
          });
        }
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
          return _this.app.redirect('/document/' + formData.slug);
        });
      };
    })(this));
  };

  return DocumentsCtrl;

})(Ctrl);
