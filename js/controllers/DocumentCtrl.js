var Ctrl, DocumentCtrl, DocumentManagerService,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentCtrl = (function(_super) {
  __extends(DocumentCtrl, _super);

  function DocumentCtrl(app, params) {
    DocumentCtrl.__super__.constructor.call(this, app, params);
    if (!this.app.user.isAuth()) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.user.github);
    Handlebars.registerHelper('releaseDotImg', function(passedString) {
      if (passedString.substr(0, 6) === 'Delete') {
        return 'img/delete-dot.png';
      } else {
        return 'img/release-dot.png';
      }
    });
  }

  DocumentCtrl.prototype.unload = function() {
    DocumentCtrl.__super__.unload.call(this);
    return $(window).unbind('resize');
  };

  DocumentCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.getDocument(this.params.slug, (function(_this) {
      return function(doc, lastContent) {
        if (!doc) {
          _this.app.redirect('/documents');
        }
        return _this.services.documentManager.getDocumentHistory(_this.params.slug, function(err, documentHistory) {
          return _this.services.documentManager.getReleaseHistory(_this.params.slug, function(err, releaseHistory) {
            var lastContentHash, localChanges, localContent, merge;
            localContent = lastContent;
            lastContentHash = MD5(lastContent);
            localChanges = false;
            merge = _this.services.documentManager.mergeHistory(releaseHistory, documentHistory);
            _this.viewParams = {
              doc: doc,
              slug: _this.params.slug,
              diff: documentHistory,
              history: merge,
              localChanges: localChanges,
              lastContent: lastContent,
              lastContentHash: lastContentHash
            };
            if (callback) {
              return callback(_this.viewParams);
            }
          });
        });
      };
    })(this));
  };

  DocumentCtrl.prototype.checkLocalChanges = function(hashToCompare) {
    var localChanges, localContent, localContentHash;
    localContent = $('#editor-content').val();
    console.log('localContent', localContent);
    localContentHash = MD5(localContent);
    localChanges = false;
    if (!hashToCompare) {
      hashToCompare = this.viewParams.lastContentHash;
    }
    if (localContentHash !== hashToCompare) {
      localChanges = true;
    }
    console.log('Check local changes', localChanges, hashToCompare, localContentHash);
    return localChanges;
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
    var changes, content, filename, message, releaseFct, slug;
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
      changes = this.checkLocalChanges();
      if (changes) {
        this.services.documentManager.saveDraft(slug, filename, content, message, (function(_this) {
          return function() {
            $("#history p:first").text(' ' + message).prepend('<img src="img/draft-dot.png">');
            return releaseFct();
          };
        })(this));
      } else {
        releaseFct();
      }
    }
    return this.services.documentManager.getDocumentHistory(this.params.slug, (function(_this) {
      return function(err, res) {
        return console.log(release);
      };
    })(this));
  };

  DocumentCtrl.prototype.autoResizeEditor = function() {
    var resize, selector;
    $('#document-panel').css('overflow', 'auto');
    selector = $('#epiceditor, #document-panel');
    resize = (function(_this) {
      return function() {
        return selector.height($(window).height() - 75);
      };
    })(this);
    resize();
    return $(window).bind('resize', (function(_this) {
      return function() {
        resize();
        return _this.editor.reflow();
      };
    })(this));
  };

  DocumentCtrl.prototype["do"] = function() {
    this.askForRedirect('Your local changes might be lost', (function(_this) {
      return function() {
        return _this.checkLocalChanges();
      };
    })(this));
    this.autoResizeEditor();
    this.editor = new EpicEditor({
      localStorageName: this.params.slug,
      textarea: 'editor-content',
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
      return function(local) {
        var hashToCompare, localChanges, localHash;
        console.log('Editor update', arguments);
        hashToCompare = _this.viewParams.lastContentHash;
        localHash = MD5(local.content);
        localChanges = localHash !== hashToCompare;
        if (localChanges && $('#history > p:first img').attr('src') !== 'img/local-dot.png') {
          $('#history').prepend('<p><img src="img/local-dot.png"> Local changes</p>');
          $('#save-draft,#release').removeAttr('disabled');
        } else if (!localChanges && $('#history > p:first img').attr('src') === 'img/local-dot.png') {
          $('#history p:first').remove();
          $('#save-draft').attr('disabled', 'disabled');
        }
        if (!localChanges && (!_this.editor || local.content.trim() === '')) {
          return $('#save-draft').removeAttr('disabled');
        }
      };
    })(this));
  };

  return DocumentCtrl;

})(Ctrl);
