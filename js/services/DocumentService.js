var DocumentService, Service,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

module.exports = DocumentService = (function(_super) {
  __extends(DocumentService, _super);

  function DocumentService() {}

  DocumentService.prototype.getContent = function() {};

  DocumentService.prototype.getMeta = function() {};

  DocumentService.prototype.createDraft = function() {};

  return DocumentService;

})(Service);
