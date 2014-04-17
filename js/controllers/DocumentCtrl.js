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
    return $('#exit-fullscreen').remove();
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
    localContent = this.editor.getValue();
    localContentHash = MD5(localContent);
    localChanges = false;
    if (!hashToCompare) {
      hashToCompare = this.viewParams.lastContentHash;
    }
    if (!hashToCompare) {
      return false;
    }
    if (localContentHash !== hashToCompare) {
      localChanges = true;
    }
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
      content = this.editor.getValue();
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
      content = this.editor.getValue();
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
    var editorSel, previewSel, resize, selector;
    $('#document-panel, #preview, #diff').css('overflow-y', 'auto');
    selector = $('#diff, #document-panel');
    editorSel = $('#editor');
    previewSel = $('#preview');
    resize = (function(_this) {
      return function() {
        selector.height($(window).height() - 75);
        editorSel.height($(window).height() - 105);
        return previewSel.height($(window).height() - 125);
      };
    })(this);
    resize();
    return $(window).bind('resize', (function(_this) {
      return function() {
        resize();
        return _this.editor.resize();
      };
    })(this));
  };

  DocumentCtrl.prototype.syncScroll = function() {
    ({
      scroll: function(src) {
        var editorH, editorScrollH, editorScrollT, previewH, previewScrollH, previewScrollT, ratioEditor, ratioPreview;
        editorH = $('#editor').height();
        previewH = $('#preview').height();
        console.log(editorH, previewH);
        if (!editorH || !previewH) {
          return false;
        }
        editorScrollH = $('#editor')[0].scrollHeight;
        previewScrollH = $('#preview')[0].scrollHeight;
        editorScrollT = $('#editor')[0].scrollTop;
        previewScrollT = $('#preview')[0].scrollTop;
        ratioEditor = editorScrollT / editorScrollH;
        ratioPreview = previewScrollT / previewScrollH;
        if (src === 'editor') {
          return console.log('editor', editorScrollT, editorScrollH, ratioEditor, console.log('preview', previewScrollT, previewScrollH, ratioPreview));
        } else {

        }
      }
    });
    console.log(this.editor);
    this.editor.onScrollTopChange((function(_this) {
      return function(e) {
        console.log(e, arguments);
        return scroll('editor');
      };
    })(this));
    return $('#preview').scroll((function(_this) {
      return function() {
        return scroll('preview');
      };
    })(this));
  };

  DocumentCtrl.prototype.patchPrettyPrint = function(patch) {
    var diff, index, line, lineCounter, lines, regexp, res, template, templateContent, type;
    if (!patch) {
      return $('#diff').html('<p class="alert alert-info">No diff with last version</p>');
    }
    lines = patch.split('\n');
    diff = [];
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
            content: '@' + line
          });
          regexp = /^@ \-([0-9]+)(,[0-9]+)? \+([0-9]+)(,[0-9]+)? @@.*$/i;
          res = line.match(regexp);
          lineCounter[0] = res[1];
          lineCounter[1] = (res[2] && res[2].substr(0, 1) === "," ? res[3] : res[2]);
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
        var t;
        if (index === 0) {
          $('#diff').hide();
          t = 'preview';
          if ($('#editor-mode').hasClass('btn-inverse')) {
            t = 'editor';
          }
          $('#' + t + ', #toolbar').show();
          return _this.editor.resize();
        } else {
          return _this.services.documentManager.getCommit(item.sha, function(err, commit) {
            var patch;
            patch = commit.files[0].patch;
            _this.patchPrettyPrint(patch);
            $('#editor, #toolbar, #preview').hide();
            return $('#diff').show();
          });
        }
      };
    })(this));
  };

  DocumentCtrl.prototype.updatePreview = function() {
    var previewContent;
    previewContent = this.editor.getValue();
    if (this.viewParams.doc.extension === 'md') {
      previewContent = marked(previewContent);
    }
    return $('#preview').html(previewContent);
  };

  DocumentCtrl.prototype.setupTheme = function() {
    var app, def, editor, list, menu, selectTheme, theme;
    editor = this.editor;
    app = this.app;
    list = ['github', 'monokai', 'terminal', 'tomorrow', 'tomorrow_night', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'xcode'];
    selectTheme = (function(_this) {
      return function(theme) {
        return $.getScript('http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/theme-' + theme + '.js', function() {
          editor.setTheme('ace/theme/' + theme);
          app.env.set('theme', theme);
          return $('#theme').find('span.name').text(theme.titleize());
        });
      };
    })(this);
    menu = $('#theme').parent().find('ul');
    list.forEach((function(_this) {
      return function(item) {
        return menu.append('<li id="' + item + '"><a href="#">' + item.titleize() + '</a></li>');
      };
    })(this));
    def = 'twilight';
    theme = this.app.env.get('theme');
    if (!theme) {
      theme = def;
    }
    selectTheme(theme);
    return $('li a', menu).click(function(e) {
      var item;
      item = $(this).parent().attr('id');
      selectTheme(item);
      $('#theme').dropdown('toggle');
      return false;
    });
  };

  DocumentCtrl.prototype.fullscreenMode = function() {
    $('#editor,#preview').show();
    $('#editor').css({
      position: 'fixed',
      left: 0,
      top: '51px',
      height: ($(window).height() - 51) + 'px',
      width: '50%'
    });
    $('#preview').css({
      position: 'fixed',
      left: '50%',
      top: '51px',
      height: ($(window).height() - 51) + 'px',
      width: '50%',
      backgroundColor: 'white',
      zIndex: 10
    });
    this.editor.resize();
    $('body').append('<button id="exit-fullscreen" class="btn btn-default">Exit fullscreen</button>');
    return $('#exit-fullscreen').click((function(_this) {
      return function() {
        $('#editor').css({
          position: 'relative',
          left: 'auto',
          top: 'auto',
          height: ($(window).height() - 106) + 'px',
          width: 'auto',
          display: ($('#editor-mode').hasClass('btn-inverse') ? 'block' : 'none')
        });
        $('#preview').css({
          position: 'static',
          left: 'auto',
          top: 'auto',
          height: ($(window).height() - 125) + 'px',
          width: 'auto',
          display: ($('#preview-mode').hasClass('btn-inverse') ? 'block' : 'none')
        });
        _this.editor.resize();
        return $('#exit-fullscreen').remove();
      };
    })(this));
  };

  DocumentCtrl.prototype["do"] = function() {
    this.app.askForRedirect('Your local changes might be lost', (function(_this) {
      return function() {
        return _this.checkLocalChanges();
      };
    })(this));
    this.autoResizeEditor();
    this.editor = ace.edit('editor');
    this.editor.getSession().setUseWrapMode(true);
    if (this.viewParams.doc.extension === 'md') {
      this.editor.getSession().setMode("ace/mode/markdown");
    } else {
      this.editor.getSession().setMode("ace/mode/html");
    }
    this.setupTheme();
    $('#preview-mode').click((function(_this) {
      return function() {
        $('#editor-mode').removeClass('btn-inverse').addClass('btn-default');
        $('#preview-mode').addClass('btn-inverse').removeClass('btn-default');
        $('#editor').hide();
        $('#preview').show();
        return $('#theme').parent().hide();
      };
    })(this));
    $('#editor-mode').click((function(_this) {
      return function() {
        $('#preview-mode').removeClass('btn-inverse').addClass('btn-default');
        $('#editor-mode').addClass('btn-inverse').removeClass('btn-default');
        $('#preview').hide();
        $('#editor').show();
        return $('#theme').parent().show();
      };
    })(this));
    $('#fullscreen-mode').click((function(_this) {
      return function() {
        return _this.fullscreenMode();
      };
    })(this));
    $("#save-draft").click((function(_this) {
      return function() {
        _this.saveDraft();
        return false;
      };
    })(this));
    $("#release").click((function(_this) {
      return function() {
        _this.release();
        return false;
      };
    })(this));
    $("#draft-message-go").click((function(_this) {
      return function() {
        if (_this.releaseMessage) {
          _this.release();
        } else {
          _this.saveDraft();
        }
        return false;
      };
    })(this));
    $("#draft-message-cancel").click((function(_this) {
      return function() {
        _this.draftMessageOpen = false;
        $("#draft-add-message").slideUp('fast');
        return false;
      };
    })(this));
    $('#remove-doc-link').click((function(_this) {
      return function() {
        if (confirm("Are you sure you want to remove this document?")) {
          _this.remove();
        }
        return false;
      };
    })(this));
    $('#rename-doc-link').click((function(_this) {
      return function() {
        return false;
      };
    })(this));
    this.setupHistory();
    this.editor.setValue(this.viewParams.lastContent);
    this.editor.clearSelection();
    this.editor.focus();
    this.editor.navigateFileStart();
    this.updatePreview();
    this.editor.on('paste', (function(_this) {
      return function(input) {
        return setTimeout((function() {
          var content;
          content = _this.editor.getValue();
          content = content.replace(/\’/g, '\'').replace(/[“”]/g, '"').replace(/…/g, '...');
          _this.editor.setValue(content);
          return _this.updatePreview();
        }), 100);
      };
    })(this));
    return this.editor.getSession().on('change', (function(_this) {
      return function() {
        var content, localChanges;
        content = _this.editor.getValue();
        localChanges = _this.viewParams.lastContentHash !== MD5(content);
        _this.updatePreview();
        return _this.history.setLocalChanges(localChanges);
      };
    })(this));
  };

  return DocumentCtrl;

})(Ctrl);
