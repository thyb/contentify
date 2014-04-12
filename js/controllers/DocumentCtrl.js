var Ctrl, DocumentCtrl, DocumentManagerService,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentCtrl = (function(_super) {
  __extends(DocumentCtrl, _super);

  function DocumentCtrl(app, params) {
    DocumentCtrl.__super__.constructor.call(this, app, params);
    if (!this.app.github) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.github);
    Handlebars.registerHelper('releaseDotImg', function(passedString) {
      if (passedString.substr(0, 6) === 'Delete') {
        return 'img/delete-dot.png';
      } else {
        return 'img/release-dot.png';
      }
    });
  }

  DocumentCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.getDocument(this.params.slug, (function(_this) {
      return function(doc) {
        console.log('getDocument', doc);
        if (!doc) {
          _this.app.redirect('/documents');
        }
        return _this.services.documentManager.getDocumentHistory(_this.params.slug, function(err, documentHistory) {
          return _this.services.documentManager.getReleaseHistory(_this.params.slug, function(err, releaseHistory) {
            var localChanges, localContent, merge, _ref, _ref1;
            localContent = JSON.parse(localStorage.getItem(_this.params.slug));
            localChanges = false;
            if ((localContent != null ? (_ref = localContent[_this.params.slug]) != null ? _ref.content.length : void 0 : void 0) > 0 && (localContent != null ? (_ref1 = localContent[_this.params.slug]) != null ? _ref1.content.trim() : void 0 : void 0) !== doc.lastVersion) {
              localChanges = true;
            }
            merge = _this.services.documentManager.mergeHistory(releaseHistory, documentHistory);
            _this.viewParams = {
              doc: doc,
              slug: _this.params.slug,
              diff: documentHistory,
              history: merge,
              localChanges: localChanges
            };
            if (callback) {
              return callback(_this.viewParams);
            }
          });
        });
      };
    })(this));
  };

  DocumentCtrl.prototype.checkLocalChanges = function(callback) {
    var localChanges, localContent, _ref;
    localContent = JSON.parse(localStorage.getItem(this.params.slug));
    localChanges = false;
    if ((localContent != null ? (_ref = localContent[this.params.slug]) != null ? _ref.content.length : void 0 : void 0) > 0 && localContent[this.params.slug].content.trim() !== this.viewParams.doc.lastVersion) {
      localChanges = true;
    }
    return callback(localChanges, localContent);
  };

  DocumentCtrl.prototype.saveDraft = function(callback) {
    var content, filename, message, slug;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      this.draftMessageOpen = true;
      $('#release').attr('disabled', 'disabled');
      if (callback) {
        callback(false);
      }
    } else {
      $('#release,#save-draft').attr('disabled', 'disabled');
      message = $("#draft-message").val();
      content = this.editor.exportFile().trim();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      this.services.documentManager.saveDraft(slug, filename, content, message, (function(_this) {
        return function() {
          $("#history p:first").text(' ' + message).prepend('<img src="img/draft-dot.png">');
          $('#draft-add-message').slideUp('fast');
          _this.draftMessageOpen = false;
          $('#release').removeAttr('disabled');
          if (callback) {
            return callback(true);
          }
        };
      })(this));
    }
    return false;
  };

  DocumentCtrl.prototype.release = function(callback) {
    var content, filename, message, releaseFct, slug;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      $('#save-draft').attr('disabled', 'disabled');
      this.releaseMessage = true;
      this.draftMessageOpen = true;
      if (callback) {
        callback(false);
      }
    } else {
      $('#release,#save-draft').attr('disabled', 'disabled');
      message = $("#draft-message").val();
      content = this.editor.exportFile().trim();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      releaseFct = (function(_this) {
        return function() {
          return _this.services.documentManager.release(slug, filename, content, message, function() {
            $("#history").prepend('<p></p>').find('p:first').text(' ' + message).prepend('<img src="img/release-dot.png">');
            $('#draft-add-message').slideUp('fast');
            _this.draftMessageOpen = false;
            _this.releaseMessage = false;
            if (callback) {
              return callback(true);
            }
          });
        };
      })(this);
      this.checkLocalChanges((function(_this) {
        return function(changes) {
          if (changes) {
            return _this.services.documentManager.saveDraft(slug, filename, content, message, function() {
              $("#history p:first").text(' ' + message).prepend('<img src="img/draft-dot.png">');
              return releaseFct();
            });
          } else {
            return releaseFct();
          }
        };
      })(this));
    }
    return this.services.documentManager.getDocumentHistory(this.params.slug, (function(_this) {
      return function(err, res) {
        return console.log(release);
      };
    })(this));
  };

  DocumentCtrl.prototype["do"] = function() {
    var resize, selector;
    $('#document-panel').css('overflow', 'auto');
    selector = $('#epiceditor, #document-panel');
    resize = function() {
      return selector.height($(window).height() - 20);
    };
    resize();
    $(window).resize(function() {
      resize();
      return this.editor.reflow();
    });
    this.editor = new EpicEditor({
      localStorageName: this.params.slug,
      focusOnLoad: true,
      basePath: '/lib/epiceditor',
      file: {
        name: this.params.slug
      }
    }).load((function(_this) {
      return function() {
        var _ref;
        if (((_ref = _this.viewParams.history[0]) != null ? _ref.imgType : void 0) === 'img/release-dot.png' && $('#history > p:first img').attr('src') !== 'img/local-dot.png' || !_this.editor || _this.editor.exportFile().trim() === '') {
          $('#save-draft').removeAttr('disabled');
        }
        $("#save-draft").click(function() {
          _this.saveDraft();
          return false;
        });
        $("#release").click(function() {
          _this.release();
          return false;
        });
        $("#draft-message-go").click(function() {
          if (_this.releaseMessage) {
            _this.release();
          } else {
            _this.saveDraft();
          }
          return false;
        });
        return $("#draft-message-cancel").click(function() {
          _this.draftMessageOpen = false;
          $("#draft-add-message").slideUp('fast');
          $('#save-draft,#release').removeAttr('disabled');
          return false;
        });
      };
    })(this));
    return this.editor.on('update', (function(_this) {
      return function() {
        return _this.checkLocalChanges(function(localChanges, localContent) {
          if (localChanges && $('#history > p:first img').attr('src') !== 'img/local-dot.png') {
            $('#history').prepend('<p><img src="img/local-dot.png"> Local changes</p>');
            $('#save-draft,#release').removeAttr('disabled');
          } else if (!localChanges && $('#history > p:first img').attr('src') === 'img/local-dot.png') {
            $('#history p:first').remove();
            $('#save-draft').attr('disabled', 'disabled');
          }
          if (!localChanges && (!_this.editor || _this.editor.exportFile().trim() === '')) {
            return $('#save-draft').removeAttr('disabled');
          }
        });
      };
    })(this));
  };

  return DocumentCtrl;

})(Ctrl);
