var Ctrl, LearnMoreCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Ctrl = require('../framework/Ctrl');

module.exports = LearnMoreCtrl = (function(_super) {
  __extends(LearnMoreCtrl, _super);

  function LearnMoreCtrl() {
    return LearnMoreCtrl.__super__.constructor.apply(this, arguments);
  }

  LearnMoreCtrl.prototype.availableDocument = ['overview', 'install', 'faq', 'sdk-js', 'sdk-node', 'faq', 'about'];

  LearnMoreCtrl.prototype["do"] = function() {
    var doc, _ref;
    contentify.initialize('thyb', 'contentify', 'draft');
    doc = 'overview';
    if (this.params.doc && (_ref = this.params.doc, __indexOf.call(this.availableDocument, _ref) >= 0)) {
      doc = this.params.doc;
    }
    $('#menu-' + doc).addClass('active');
    return $('#learn-content').includeContent(doc + '.md', function(elem) {
      elem.find('img').addClass('img-responsive');
      return elem.find('pre').each(function(i, e) {
        return hljs.highlightBlock(e);
      });
    });
  };

  return LearnMoreCtrl;

})(Ctrl);
