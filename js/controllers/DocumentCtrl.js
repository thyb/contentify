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
  }

  DocumentCtrl.prototype.unload = function() {
    DocumentCtrl.__super__.unload.call(this);
    $(window).unbind('resize');
    return $('#exit-fullscreen').remove();
  };

  DocumentCtrl.prototype.initialize = function(callback) {
    this.params.filename = decodeURIComponent(this.params.filename);
    return this.services.documentManager.checkAccess(this.app.user.get('login'), (function(_this) {
      return function(access) {
        if (!access) {
          return _this.app.redirect('/403');
        }
        _this.access = access;
        return _this.services.documentManager.getDocument(_this.params.filename, function(doc, lastContent) {
          if (!doc) {
            _this.app.redirect('/documents');
          }
          return _this.services.documentManager.getDocumentHistory(_this.params.filename, function(err, documentHistory) {
            return _this.services.documentManager.getReleaseHistory(_this.params.filename, function(err, releaseHistory) {
              var lastContentHash, localChanges, localContent, merge;
              localContent = lastContent;
              lastContentHash = MD5(lastContent);
              localChanges = false;
              merge = _this.services.documentManager.mergeHistory(releaseHistory, documentHistory);
              _this.viewParams = {
                doc: doc,
                filename: _this.params.filename,
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
    var content, filename, message;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      this.draftMessageOpen = true;
      if (callback) {
        callback(false);
      }
    } else {
      message = $("#draft-message").val();
      content = this.editor.getValue();
      filename = this.viewParams.filename;
      this.services.documentManager.saveDraft(filename, content, message, (function(_this) {
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
    var changes, content, filename, message, releaseFct;
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
      filename = this.viewParams.filename;
      releaseFct = (function(_this) {
        return function() {
          return _this.services.documentManager.release(filename, content, message, function(err, res) {
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
        return this.services.documentManager.saveDraft(filename, content, message, (function(_this) {
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
    var filename;
    filename = this.viewParams.filename;
    return this.services.documentManager.remove(filename, (function(_this) {
      return function() {
        _this.app.askForRedirect(false);
        return _this.app.redirect('/documents');
      };
    })(this));
  };

  DocumentCtrl.prototype.autoResizeEditor = function() {
    var editorSel, previewSel, resize, selector;
    $('#document-panel, #preview, #diff').css('overflow-y', 'auto');
    selector = $('#document-panel');
    editorSel = $('#editor,#diff');
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
    var scroll;
    scroll = (function(_this) {
      return function(src, editorScrollT) {
        var editorH, editorScrollH, previewH, previewScrollH, previewScrollT, ratioEditor, ratioEditor2, ratioPreview;
        if ($('#editor').css('display') === 'none' || $('#preview').css('display') === 'none') {
          return false;
        }
        editorH = $('#editor').height();
        previewH = $('#preview').outerHeight();
        previewScrollT = $('#preview')[0].scrollTop;
        editorScrollH = _this.editor.getSession().getScreenLength() * 16;
        previewScrollH = $('#preview')[0].scrollHeight;
        if (editorScrollH < 0) {
          editorScrollH = 0;
        }
        if (previewScrollH < 0) {
          previewScrollH = 0;
        }
        ratioPreview = previewScrollT / (previewScrollH - previewH);
        ratioEditor = editorScrollT / (editorScrollH - editorH);
        ratioEditor2 = editorH / editorScrollH;
        if (src === 'editor') {
          return $('#preview')[0].scrollTop = ratioEditor * (previewScrollH - previewH);
        } else {
          return _this.editor.getSession().setScrollTop(ratioPreview * (editorScrollH - editorH));
        }
      };
    })(this);
    this.editor.getSession().on('changeScrollTop', (function(_this) {
      return function(scrollTop) {
        return scroll('editor', scrollTop);
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
    this.history.on('select', (function(_this) {
      return function(item, index) {
        var t;
        if (index === 0) {
          $('#version, #toolbar-versionning').hide();
          t = 'preview';
          if ($('#editor-mode').hasClass('btn-inverse')) {
            if ($('#editor').parent().hasClass('firepad')) {
              $('#editor').parent().show();
            }
            t = 'editor';
          }
          $('#' + t + ', #toolbar-editor').show();
          return _this.editor.resize();
        } else {
          return _this.services.documentManager.getCommit(item.sha, function(err, commit) {
            var patch;
            patch = commit.files[0].patch;
            _this.patchPrettyPrint(patch);
            $('#raw-diff').html(commit.raw);
            $('#preview-diff').html(marked(commit.raw));
            $('#editor, #toolbar-editor, #preview').hide();
            if ($('#editor').parent().hasClass('firepad')) {
              $('#editor').parent().hide();
            }
            return $('#version, #toolbar-versionning').show();
          });
        }
      };
    })(this));
    $('#revert').click((function(_this) {
      return function() {
        var content;
        if (confirm('Are you sure you want revert to this version? You can undo with `cmd + z`.')) {
          content = $('#raw-diff').html();
          _this.editor.setValue(content);
          _this.history.change(0);
          _this.editor.clearSelection();
          _this.editor.focus();
          return _this.editor.navigateFileStart();
        }
      };
    })(this));
    $('#preview-version-mode').click((function(_this) {
      return function() {
        $('#preview-diff').show();
        $('#diff, #raw-diff').hide();
        $('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass('btn-inverse');
        return $('#preview-version-mode').removeClass('btn-default').addClass('btn-inverse');
      };
    })(this));
    $('#diff-mode').click((function(_this) {
      return function() {
        $('#diff').show();
        $('#preview-diff, #raw-diff').hide();
        $('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass('btn-inverse');
        return $('#diff-mode').removeClass('btn-default').addClass('btn-inverse');
      };
    })(this));
    return $('#raw-mode').click((function(_this) {
      return function() {
        $('#raw-diff').show();
        $('#diff, #preview-diff').hide();
        $('#toolbar-versionning .btn-inverse').addClass('btn-default').removeClass('btn-inverse');
        return $('#raw-mode').removeClass('btn-default').addClass('btn-inverse');
      };
    })(this));
  };

  DocumentCtrl.prototype.updatePreview = function() {
    var previewContent;
    previewContent = marked(this.editor.getValue());
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
    if ($('#editor').parent().hasClass('firepad')) {
      $('#editor').parent().show();
    }
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
        if ($('#editor').parent().hasClass('firepad') && $('#editor').css('display') === 'none') {
          $('#editor').parent().hide();
        }
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
    this.editor.getSession().setMode("ace/mode/markdown");
    this.setupTheme();
    $('#preview-mode').click((function(_this) {
      return function() {
        $('#editor-mode').removeClass('btn-inverse').addClass('btn-default');
        $('#preview-mode').addClass('btn-inverse').removeClass('btn-default');
        $('#editor').hide();
        if ($('#editor').parent().hasClass('firepad')) {
          $('#editor').parent().hide();
        }
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
        if ($('#editor').parent().hasClass('firepad')) {
          $('#editor').parent().show();
        }
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
    $('#fork').click((function(_this) {
      return function() {
        return alert('work in progress');
      };
    })(this));
    this.setupHistory();
    if (this.access === 'collaborator' && config.firebase_url && config.firebase_url !== '') {
      $('#editor').append('<div id="loader-editor"> <div class="teardrop tearLeft"></div> <div class="teardrop tearRight"></div> <div id="contain1"> <div id="ball-holder1"> <div class="ballSettings ball1"></div> </div> </div> <div id="contain2"> <div id="ball-holder2"> <div class="ballSettings ball2"></div> </div> </div> </div>');
      this.firepadRef = new Firebase('https://' + config.firebase_url + '/firepad/' + this.viewParams.filename.replace('.', '-'));
      this.firepad = Firepad.fromACE(this.firepadRef, this.editor);
      this.firepad.on('ready', (function(_this) {
        return function() {
          var text;
          $('#loader-editor').remove();
          text = _this.firepad.getText();
          if (text === '') {
            return _this.firepad.setText(_this.viewParams.lastContent);
          }
        };
      })(this));
    } else {
      this.editor.setValue(this.viewParams.lastContent);
      this.editor.clearSelection();
      this.editor.focus();
      this.editor.navigateFileStart();
      if (this.access === 'guest') {
        this.editor.setReadOnly(true);
        $("#save-draft,#release").hide();
        $('#read-only').show();
      }
    }
    this.syncScroll();
    this.updatePreview();
    this.editor.on('paste', (function(_this) {
      return function(input) {
        return setTimeout((function() {
          var content, cur;
          content = _this.editor.getValue();
          if (content.match(/[’“”]/g)) {
            content = content.replace(/\’/g, '\'').replace(/[“”]/g, '"').replace(/…/g, '...');
            cur = _this.editor.selection.getCursor();
            _this.editor.setValue(content);
            _this.editor.clearSelection();
            _this.editor.selection.moveCursorToPosition(cur);
            return _this.editor.scrollToLine(cur.row, true, false, function() {});
          }
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
