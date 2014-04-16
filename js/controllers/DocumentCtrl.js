var Ctrl, DocumentCtrl, DocumentHistory, DocumentManagerService,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

DocumentHistory = require('../components/DocumentHistory');

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
    $(window).unbind('resize');
    try {
      return this.editor.unload();
    } catch (_error) {}
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
    localContentHash = MD5(localContent);
    localChanges = false;
    if (!hashToCompare) {
      hashToCompare = this.viewParams.lastContentHash;
    }
    console.log('check changes', hashToCompare, localContentHash);
    if (!hashToCompare) {
      return false;
    }
    if (localContentHash !== hashToCompare) {
      localChanges = true;
    }
    console.log(localChanges);
    return localChanges;
  };

  DocumentCtrl.prototype.saveDraft = function(callback) {
    var content, filename, message, slug;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      this.draftMessageOpen = true;
      if (callback) {
        callback(false);
      }
    } else {
      message = $("#draft-message").val();
      content = this.editor.exportFile();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      this.services.documentManager.saveDraft(slug, filename, content, message, (function(_this) {
        return function(err, res) {
          _this.viewParams.lastContent = content;
          _this.viewParams.lastContentHash = MD5(content);
          _this.services.documentManager.getCommit(res.commit.sha, function(err, lastCommit) {
            _this.history.setLocalChanges(false);
            lastCommit.commit_type = 'draft';
            return _this.history.add(lastCommit);
          });
          $('#draft-add-message').slideUp('fast');
          _this.draftMessageOpen = false;
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
      this.releaseMessage = true;
      this.draftMessageOpen = true;
      if (callback) {
        return callback(false);
      }
    } else {
      message = $("#draft-message").val();
      content = this.editor.exportFile();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      releaseFct = (function(_this) {
        return function() {
          return _this.services.documentManager.release(slug, filename, content, message, function(err, res) {
            _this.viewParams.lastContent = content;
            _this.viewParams.lastContentHash = MD5(content);
            _this.services.documentManager.getCommit(res.commit.sha, function(err, lastCommit) {
              _this.history.setLocalChanges(false);
              lastCommit.commit_type = 'release';
              return _this.history.add(lastCommit);
            });
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
        return this.services.documentManager.saveDraft(slug, filename, content, message, (function(_this) {
          return function(err, res) {
            _this.viewParams.lastContent = content;
            _this.viewParams.lastContentHash = MD5(content);
            _this.services.documentManager.getCommit(res.commit.sha, function(err, lastCommit) {
              _this.history.setLocalChanges(false);
              lastCommit.commit_type = 'draft';
              return _this.history.add(lastCommit);
            });
            return releaseFct();
          };
        })(this));
      } else {
        return releaseFct();
      }
    }
  };

  DocumentCtrl.prototype.remove = function(callback) {
    var slug;
    slug = this.viewParams.slug;
    return this.services.documentManager.remove(slug, (function(_this) {
      return function() {
        _this.app.askForRedirect(false);
        return _this.app.redirect('/documents');
      };
    })(this));
  };

  DocumentCtrl.prototype.autoResizeEditor = function() {
    var resize, selector;
    $('#document-panel, #diff').css('overflow-y', 'auto');
    selector = $('#epiceditor, #diff, #document-panel');
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

  DocumentCtrl.prototype.patchPrettyPrint = function(patch) {
    var diff, index, line, lineCounter, lines, regexp, res, template, templateContent, type;
    lines = patch.split('\n');
    diff = [];
    console.log("start prettyprint", lines);
    lineCounter = [1, 1];
    for (index in lines) {
      line = lines[index].substr(1);
      type = lines[index].substr(0, 1);
      switch (type) {
        case '@':
          diff.push({
            cssClass: 'active',
            line1: '',
            line2: '',
            content: line
          });
          regexp = /^@ \-([0-9]+),[0-9]+ \+([0-9]+),[0-9]+ @@.*$/i;
          res = line.match(regexp);
          lineCounter[0] = res[1];
          lineCounter[1] = res[2];
          break;
        case ' ':
          diff.push({
            cssClass: '',
            line1: lineCounter[0]++,
            line2: lineCounter[1]++,
            content: line
          });
          break;
        case '+':
          diff.push({
            cssClass: 'success',
            line1: lineCounter[0]++,
            line2: '',
            content: line
          });
          break;
        case '-':
          diff.push({
            cssClass: 'danger',
            line1: '',
            line2: lineCounter[1]++,
            content: line
          });
      }
    }
    templateContent = '<table class="table table-responsive table-condensed"> {{#each lines}} <tr class={{cssClass}}> <td class="line" style="color:">{{line1}}</td> <td class="line">{{line2}}</td> <td class="content"><pre>{{content}}</pre></td> </tr> {{/each}} </table>';
    template = Handlebars.compile(templateContent);
    return $('#diff').html(template({
      lines: diff
    }));
  };

  DocumentCtrl.prototype.setupHistory = function() {
    this.history = new DocumentHistory(this.viewParams.history, this.app.user, this.editor);
    this.history.render($('#history'));
    return this.history.on('select', (function(_this) {
      return function(item, index) {
        if (index === 0) {
          $('#diff').hide();
          $('#epiceditor').show();
          return _this.editor.reflow();
        } else {
          return _this.services.documentManager.getCommit(item.sha, function(err, commit) {
            var patch;
            patch = commit.files[0].patch;
            _this.patchPrettyPrint(patch);
            $('#epiceditor').hide();
            $('#diff').show();
            return console.log(err, commit);
          });
        }
      };
    })(this));
  };

  DocumentCtrl.prototype["do"] = function() {
    var editorOptions;
    this.app.askForRedirect('Your local changes might be lost', (function(_this) {
      return function() {
        return _this.checkLocalChanges();
      };
    })(this));
    this.autoResizeEditor();
    editorOptions = {
      textarea: 'editor-content',
      focusOnLoad: true,
      basePath: './lib/epiceditor',
      file: {
        name: this.params.slug
      }
    };
    if (this.viewParams.doc.extension === 'html') {
      editorOptions.parser = false;
    }
    this.editor = new EpicEditor(editorOptions).load((function(_this) {
      return function() {
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
        $("#draft-message-cancel").click(function() {
          _this.draftMessageOpen = false;
          $("#draft-add-message").slideUp('fast');
          return false;
        });
        $('#remove-doc-link').click(function() {
          if (confirm("Are you sure you want to remove this document?")) {
            _this.remove();
          }
          return false;
        });
        return $('#rename-doc-link').click(function() {
          return false;
        });
      };
    })(this));
    this.setupHistory();
    this.editor.importFile(this.params.slug, this.viewParams.lastContent);
    return this.editor.on('update', (function(_this) {
      return function(local) {
        var localChanges;
        localChanges = _this.viewParams.lastContentHash !== MD5(local.content);
        return _this.history.setLocalChanges(localChanges);
      };
    })(this));
  };

  return DocumentCtrl;

})(Ctrl);
