var DocumentManagerService, DocumentService, Service,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

DocumentService = require('./DocumentService');

DocumentManagerService = (function(_super) {
  __extends(DocumentManagerService, _super);

  function DocumentManagerService() {
    return DocumentManagerService.__super__.constructor.apply(this, arguments);
  }

  DocumentManagerService.prototype.documents = [];

  DocumentManagerService.prototype.createOrOpen = function(slug, options) {};

  DocumentManagerService.prototype.diff = function(slug, v1, v2) {};

  DocumentManagerService.prototype.list = function() {};

  return DocumentManagerService;

})(Service);
