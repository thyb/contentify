(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DocumentHistory;

module.exports = DocumentHistory = (function() {
  function DocumentHistory(initialHistory, me) {
    var author, hist, _i, _len;
    this.me = me;
    this.current = 0;
    this.history = [];
    this.listeners = {};
    for (_i = 0, _len = initialHistory.length; _i < _len; _i++) {
      hist = initialHistory[_i];
      author = this.getAuthor(hist);
      this.history.push({
        sha: hist.sha,
        version_type: hist.commit_type,
        message: hist.commit.message,
        login: author.login,
        avatar_url: author.avatar_url
      });
    }
    this.generateTemplate();
  }

  DocumentHistory.prototype.getAuthor = function(commit) {
    var _ref;
    if ((_ref = commit.author) != null ? _ref.login : void 0) {
      return {
        login: commit.author.login,
        avatar_url: commit.author.avatar_url
      };
    } else {
      return {
        login: commit.commit.author.name,
        avatar_url: 'http://www.gravatar.com/avatar/' + MD5(commit.commit.author.email.trim().toLowerCase())
      };
    }
  };

  DocumentHistory.prototype.add = function(hist) {
    var author;
    author = this.getAuthor(hist);
    this.history.unshift({
      sha: hist.sha,
      version_type: hist.commit_type,
      message: hist.commit.message,
      login: author.login,
      avatar_url: author.avatar_url
    });
    if (this.current !== 0) {
      this.current++;
    }
    return this.renderElement(0);
  };

  DocumentHistory.prototype.setLocalChanges = function(state) {
    var _ref, _ref1;
    if (state) {
      if (((_ref = this.history[0]) != null ? _ref.version_type : void 0) === 'local') {
        return false;
      }
      this.history.unshift({
        version_type: 'local',
        message: 'Local changes',
        login: this.me.get('login'),
        avatar_url: this.me.get('avatar_url')
      });
      if (this.current !== 0) {
        this.current++;
      }
      return this.renderElement(0);
    } else {
      if (!this.history[0] || ((_ref1 = this.history[0]) != null ? _ref1.version_type : void 0) !== 'local') {
        return false;
      }
      this.history.shift();
      this.container.find('p:first').remove();
      this.container.find('p.active').removeClass('active');
      return this.container.find('p:eq(' + this.current.toString() + ')').addClass('active');
    }
  };

  DocumentHistory.prototype.on = function(e, callback) {
    if (!this.listeners[e]) {
      this.listeners[e] = [];
    }
    return this.listeners[e].push(callback);
  };

  DocumentHistory.prototype.renderElement = function(index, init) {
    var elem, selector;
    if (!init) {
      init = false;
    }
    elem = this.history[index];
    if (init) {
      this.container.append(this.template(elem));
    } else if (index === 0) {
      this.container.prepend(this.template(elem));
    } else {
      this.container.find('p:eq(' + index.toString() + ')').html(this.template(elem));
    }
    selector = this.container.find('p:eq(' + index.toString() + ')');
    if (index === this.current) {
      this.container.find('p.active').removeClass('active');
      selector.addClass('active');
    }
    return selector.click((function(_this) {
      return function() {
        var ind;
        if (!selector.hasClass('active')) {
          ind = selector.index();
          return _this.change(ind);
        }
      };
    })(this));
  };

  DocumentHistory.prototype.change = function(index) {
    this.current = index;
    this.container.find('p.active').removeClass('active');
    this.container.find('p:eq(' + index.toString() + ')').addClass('active');
    return this.listeners['select'].each((function(_this) {
      return function(fct) {
        return fct(_this.history[index], index);
      };
    })(this));
  };

  DocumentHistory.prototype.render = function(container) {
    var i, _results;
    this.container = container;
    this.container.html('');
    _results = [];
    for (i in this.history) {
      _results.push(this.renderElement(parseInt(i), true));
    }
    return _results;
  };

  DocumentHistory.prototype.generateTemplate = function() {
    var content;
    content = '<p> <img width="42" height="42" title="{{login}}" class="img-circle {{version_type}}" src="{{avatar_url}}"> <span class="msg">{{message}}</span> </p>';
    return this.template = Handlebars.compile(content);
  };

  return DocumentHistory;

})();

},{}],2:[function(require,module,exports){
var AlwaysCtrl, Ctrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = AlwaysCtrl = (function(_super) {
  __extends(AlwaysCtrl, _super);

  function AlwaysCtrl() {
    return AlwaysCtrl.__super__.constructor.apply(this, arguments);
  }

  AlwaysCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  AlwaysCtrl.prototype["do"] = function() {};

  AlwaysCtrl.prototype.on = {
    "signin": function() {},
    "logout": function() {}
  };

  return AlwaysCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],3:[function(require,module,exports){
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
    return this.services.documentManager.checkAccess(this.app.user.get('login'), (function(_this) {
      return function(access) {
        if (!access) {
          return _this.app.redirect('/403');
        }
        _this.access = access;
        return _this.services.documentManager.getDocument(_this.params.filename, function(doc, lastContent) {
          if (!doc) {
            _this.app.redirect('/404');
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

},{"../components/DocumentHistory":1,"../framework/Ctrl":11,"../services/DocumentManagerService":22}],4:[function(require,module,exports){
var Ctrl, DocumentManagerService, DocumentsCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentsCtrl = (function(_super) {
  __extends(DocumentsCtrl, _super);

  function DocumentsCtrl(app, params) {
    DocumentsCtrl.__super__.constructor.call(this, app, params);
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
        _this.access = access;
        return _this.services.documentManager.list(_this.params.foldername, function(err, data) {
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
    if (this.access === 'guest') {
      $("#create-document").hide();
      $('#read-only').show();
    }
    $('#create-document').click(function() {
      return $('#new-document-modal').modal('show');
    });
    $('#create-folder').click(function() {
      return $('#new-folder-modal').modal('show');
    });
    $('#new-document-modal .create-button').click((function(_this) {
      return function() {
        var formData;
        formData = {
          title: $('#name-input').val(),
          filename: $('#filename-input').val() + '.md'
        };
        return _this.services.documentManager.create(formData.filename, formData.title, function(err) {
          if (err) {
            if (!err.msg) {
              err.msg = JSON.stringify(err);
            }
            $('#new-document-modal form .alert').html(err.msg).removeClass('hide');
            return false;
          }
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
          return _this.app.redirect('/document/' + formData.filename);
        });
      };
    })(this));
    return $('#new-folder-modal .create-button').click((function(_this) {
      return function() {
        var formData;
        formData = {
          name: $('#new-folder-modal .name-input').val()
        };
        return _this.services.documentManager.createFolder(formData.name, function(err) {
          if (err) {
            if (!err.msg) {
              err.msg = JSON.stringify(err);
            }
            $('#new-document-modal form .alert').html(err.msg).removeClass('hide');
            return false;
          }
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
          return _this.app.redirect('/document/' + formData.filename);
        });
      };
    })(this));
  };

  return DocumentsCtrl;

})(Ctrl);

},{"../framework/Ctrl":11,"../services/DocumentManagerService":22}],5:[function(require,module,exports){
var Ctrl, ErrorCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = ErrorCtrl = (function(_super) {
  __extends(ErrorCtrl, _super);

  function ErrorCtrl(app, params) {
    ErrorCtrl.__super__.constructor.call(this, app);
    if (params.path === '/403') {
      this.setView('error/403');
    } else {
      this.setView('error/404');
    }
  }

  ErrorCtrl.prototype["do"] = function() {};

  return ErrorCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],6:[function(require,module,exports){
var Ctrl, IndexCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = IndexCtrl = (function(_super) {
  __extends(IndexCtrl, _super);

  function IndexCtrl(app) {
    IndexCtrl.__super__.constructor.call(this, app);
    if (this.app.user.isAuth()) {
      this.app.redirect('/documents');
    }
  }

  IndexCtrl.prototype["do"] = function() {
    return $('button.btn-primary').click((function(_this) {
      return function() {
        return OAuth.popup('github', function(err, res) {
          if (err) {
            return console.log(err);
          }
          return res.get('/user').done(function(data) {
            _this.app.user.login(data, {
              access_token: res.access_token,
              provider: 'github'
            });
            return _this.app.redirect('/documents');
          });
        });
      };
    })(this));
  };

  return IndexCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],7:[function(require,module,exports){
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
    contentify.initialize('thyb', 'contentify', 'release');
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

},{"../framework/Ctrl":11}],8:[function(require,module,exports){
var Ctrl, LogoutCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = LogoutCtrl = (function(_super) {
  __extends(LogoutCtrl, _super);

  function LogoutCtrl(app) {
    LogoutCtrl.__super__.constructor.call(this, app);
    this.app.user.logout();
    this.app.redirect('/');
  }

  return LogoutCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],9:[function(require,module,exports){
var Ctrl, MediasCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = MediasCtrl = (function(_super) {
  __extends(MediasCtrl, _super);

  function MediasCtrl(app) {
    MediasCtrl.__super__.constructor.call(this, app);
  }

  MediasCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  MediasCtrl.prototype["do"] = function() {};

  return MediasCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],10:[function(require,module,exports){
var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager, User;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

User = require('./User');

module.exports = App = (function() {
  function App() {
    Handlebars.registerHelper('encodeurl', function(text) {
      return encodeURIComponent(text);
    });
    this.env = new Env();
    this.event = new GlobalEvent();
    this.ctrlManager = new CtrlManager(this);
    this.templateManager = TemplateManager;
    this.layoutManager = LayoutManager;
    this.ready = true;
    this.user = new User(this);
  }

  App.prototype.initializeRouter = function(setting) {
    this.router = new Router(this, setting);
    return this.router;
  };

  App.prototype.setLayout = function(layout) {
    this.ready = false;
    this.layoutManager.set(layout, (function(_this) {
      return function() {
        _this.router.setDefaultPlacement('#content');
        _this.ready = true;
        if (_this.started) {
          return _this.start();
        }
      };
    })(this));
    return this;
  };

  App.prototype.start = function() {
    var hash;
    this.started = true;
    if (this.ready) {
      this.user.initialize();
      hash = window.location.hash;
      if (hash && hash !== '#') {
        return this.redirect(hash.substr(1));
      } else if (!this.router._state) {
        return this.redirect('/');
      } else {
        return this.redirect(this.router._state);
      }
    }
  };

  App.prototype.askForRedirect = function(msg, answer) {
    if (!msg) {
      this._askedForRedirect = false;
      return this._askedForRedirectFct = null;
    } else {
      this._askedForRedirect = true;
      this._askedForRedirectFct = answer;
      return $(window).bind('beforeunload', function() {
        return 'Your local changes might be lost';
      });
    }
  };

  App.prototype.redirect = function(path) {
    var answer;
    if (this._askedForRedirect) {
      answer = this._askedForRedirectFct();
      if (!answer || (answer && confirm('Are you sure you want to quit this page? all local changes will be lost.'))) {
        this._askedForRedirect = false;
        this._askedForRedirectFct = null;
        $(window).unbind('beforeunload');
        return this.router.stopPropagate(path).change(path);
      } else {
        this.router.nextNoRedirect = true;
        return this.router.changeHash(this.router._state);
      }
    } else {
      return this.router.stopPropagate(path).change(path);
    }
  };

  App.prototype.refreshMenu = function(path) {
    if (!this.menu) {
      return false;
    }
    $('li.active', this.menu).removeClass('active');
    $('li a[href="#' + path + '"]').parent().addClass('active');
    if (!this.user.isAuth()) {
      $('li.need-auth').hide();
    }
    if (this.user.isAuth()) {
      return $('li.need-auth').show();
    }
  };

  App.prototype.setMenu = function(selector) {
    this.menu = selector;
    return this;
  };

  App.prototype.setTitle = function(title) {};

  App.prototype.setMeta = function(meta, value) {};

  return App;

})();

},{"./CtrlManager":12,"./Env":13,"./GlobalEvent":14,"./LayoutManager":15,"./Router":16,"./TemplateManager":18,"./User":19}],11:[function(require,module,exports){
var Ctrl, View;

View = require('./View');

module.exports = Ctrl = (function() {
  function Ctrl(app, params) {
    var ctrlname;
    this.app = app;
    this.params = params;
    ctrlname = this.constructor.name;
    ctrlname = ctrlname.substr(0, ctrlname.length - 4);
    ctrlname = ctrlname.replace(/([A-Z])/g, "-$1");
    this.templateUrl = ctrlname.substr(1).toLowerCase() + '.html';
    this.scope = {};
    this.view = new View();
    this.services = {};
    this._askedForRedirect = false;
  }

  Ctrl.prototype.use = function(callback) {
    return this.render((function(_this) {
      return function() {
        _this["do"]();
        if (callback()) {
          return callback;
        }
      };
    })(this));
  };

  Ctrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  Ctrl.prototype["do"] = function() {};

  Ctrl.prototype.render = function(callback) {
    return this.initialize((function(_this) {
      return function(params) {
        return _this.view.render(_this.templateUrl, params, _this.app.router.defaultPlacement, callback);
      };
    })(this));
  };

  Ctrl.prototype.include = function(ctrl, placement, callback) {};

  Ctrl.prototype.setView = function(template) {
    return this.templateUrl = template + '.html';
  };

  Ctrl.prototype.unload = function() {
    if (this._askedForRedirect) {
      return $(window).unbind('beforeunload');
    }
  };

  return Ctrl;

})();

},{"./View":20}],12:[function(require,module,exports){
var CtrlManager;

module.exports = CtrlManager = (function() {
  function CtrlManager(app) {
    this.app = app;
    this.partials = [];
  }

  CtrlManager.prototype.setMaster = function(ctrl, params, callback) {
    if (this.master) {
      this.master.unload();
    }
    this.master = new ctrl(this.app, params);
    $('#content').html('<div style="margin-top: 100px; text-align:center" id="loading"><img src="./img/loading.gif"></div>');
    if (this.app.router.stop && this.app.router.stop !== params.path) {
      return (this.app.router.stop = false);
    }
    return this.master.use(callback);
  };

  CtrlManager.prototype.addPartial = function(ctrl, placement, callback) {
    this.partials.push({
      ctrl: new ctrl(this.app, {
        placement: placement
      })
    });
    return this.partials[this.partials.length - 1].ctrl.use(callback);
  };

  CtrlManager.prototype.removePartial = function(ctrl, placement) {
    var partial;
    for (partial in this.partials) {
      if (partials[partial].placement === placement) {
        delete partials[partial];
      }
    }
    return $(placement).html('');
  };

  return CtrlManager;

})();

},{}],13:[function(require,module,exports){
var Env;

module.exports = Env = (function() {
  var data;

  data = {};

  function Env() {
    if (localStorage) {
      try {
        data = JSON.parse(localStorage.getItem('env'));
      } catch (_error) {}
      if (!data) {
        data = {};
      }
    }
  }

  Env.prototype.set = function(key, value) {
    data[key] = value;
    if (localStorage) {
      return localStorage.setItem('env', JSON.stringify(data));
    }
  };

  Env.prototype.get = function(key) {
    return data[key];
  };

  return Env;

})();

},{}],14:[function(require,module,exports){
var GlobalEvent;

module.exports = GlobalEvent = (function() {
  function GlobalEvent() {
    this.listeners = [];
  }

  GlobalEvent.prototype.emit = function(name, value) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.name === name) {
        _results.push(listener.callback(value));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  GlobalEvent.prototype.on = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return GlobalEvent;

})();

},{}],15:[function(require,module,exports){
var LayoutManager;

module.exports = LayoutManager = (function() {
  var Layout, baseUrl, layout, layouts;

  function LayoutManager() {}

  layouts = {};

  layout = null;

  baseUrl = './tmpl/layout/';

  Layout = (function() {
    function Layout(template) {
      this.template = template;
    }

    Layout.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template + '.html',
        type: "get"
      }).done((function(_this) {
        return function(content) {
          _this.content = content;
          if (callback) {
            return callback(content);
          }
        };
      })(this));
    };

    return Layout;

  })();

  LayoutManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  LayoutManager.set = function(l, callback) {
    layout = l;
    if (layouts[layout] == null) {
      layouts[layout] = new Layout(layout);
    }
    return layouts[layout].getContent((function(_this) {
      return function(content) {
        $('body').html(content);
        return callback();
      };
    })(this));
  };

  return LayoutManager;

})();

},{}],16:[function(require,module,exports){
var Router, View;

View = require('./View');

module.exports = Router = (function() {
  function Router(app, setup) {
    this.app = app;
    this._routes = setup;
    this.changingHash = false;
    this.defaultPlacement = 'body';
    $(window).hashchange((function(_this) {
      return function() {
        if (_this.nextNoRedirect) {
          return _this.nextNoRedirect = false;
        } else {
          return _this.app.redirect(window.location.hash.substr(1));
        }
      };
    })(this));
  }

  Router.prototype.setDefaultPlacement = function(defaultPlacement) {
    this.defaultPlacement = defaultPlacement;
    return this;
  };

  Router.prototype.changeHash = function(path) {
    this._state = path;
    this.changingHash = true;
    return window.location.hash = this._state;
  };

  Router.prototype._checkPath = function(path) {
    var masterCtrl, masterParams, param, params, regexpStr, res, route;
    masterParams = {};
    for (route in this._routes) {
      if (route.indexOf('/:') !== -1) {
        res = route.match(/\/:([a-zA-Z0-9]+)/);
        res.shift();
        params = res;
        regexpStr = route.replace(/\/:[a-zA-Z0-9]+/g, '/([a-zA-Z0-9_\\-\\./]+)').replace(/\//g, '\\/');
        res = path.match(new RegExp(regexpStr));
        if (!res) {
          continue;
        }
        res.shift();
        for (param in params) {
          if (param === 'index' || param === 'input') {
            continue;
          }
          masterParams[params[param]] = res[param];
        }
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
      } else if (route === path) {
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
        break;
      }
    }
    masterParams['path'] = path;
    return {
      master: masterCtrl,
      masterParams: masterParams,
      partial: null
    };
  };

  Router.prototype.stopPropagate = function(path) {
    this.stop = path;
    return this;
  };

  Router.prototype.change = function(path) {
    var res;
    res = this._checkPath(path);
    if (!res.master) {
      return this.change('/404');
    }
    this.changeHash(path);
    this.app.ctrlManager.setMaster(res.master, res.masterParams, (function(_this) {
      return function() {
        if (_this.stop) {
          _this.stop = false;
        }
        return _this.app.refreshMenu(path);
      };
    })(this));
    return this;
  };

  return Router;

})();

},{"./View":20}],17:[function(require,module,exports){
var Service;

module.exports = Service = (function() {
  function Service() {}

  return Service;

})();

},{}],18:[function(require,module,exports){
var TemplateManager;

module.exports = TemplateManager = (function() {
  var Template, baseUrl, instances;

  function TemplateManager() {}

  instances = {};

  baseUrl = './tmpl/main/';

  Template = (function() {
    function Template(template) {
      this.template = template;
    }

    Template.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template,
        type: "get"
      }).done(callback);
    };

    return Template;

  })();

  TemplateManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  TemplateManager.get = function(template, callback) {
    if (instances[template] == null) {
      instances[template] = new Template(template);
    }
    return instances[template].getContent(callback);
  };

  return TemplateManager;

})();

},{}],19:[function(require,module,exports){
var User;

module.exports = User = (function() {
  function User(app) {
    this.app = app;
    if (this.app.env.get('auth')) {
      if (this.app.env.get('access_token') && this.app.env.get('provider')) {
        if (this.app.env.get('provider') === 'github') {
          this.github = new Github({
            token: this.app.env.get('access_token'),
            auth: 'oauth'
          });
        }
      }
    }
  }

  User.prototype.initialize = function() {
    if (this.app.env.get('auth')) {
      return this.app.event.emit("login");
    }
  };

  User.prototype.login = function(userinfo, social) {
    this.app.env.set('auth', true);
    this.app.env.set('userinfo', userinfo);
    if (social.provider && social.access_token) {
      this.app.env.set('access_token', social.access_token);
      this.app.env.set('provider', social.provider);
      if (social.provider === 'github') {
        this.github = new Github({
          token: social.access_token,
          auth: 'oauth'
        });
      }
    }
    return this.app.event.emit("login");
  };

  User.prototype.setRight = function(right) {
    this.right = right;
  };

  User.prototype.isAuth = function() {
    return this.app.env.get('auth');
  };

  User.prototype.get = function(key) {
    return this.app.env.get('userinfo')[key];
  };

  User.prototype.logout = function() {
    this.github = null;
    this.app.env.set('auth', false);
    this.app.env.set('username', '');
    this.app.env.set('access_token', '');
    this.app.env.set('provider', '');
    return this.app.event.emit('logout');
  };

  return User;

})();

},{}],20:[function(require,module,exports){
var TemplateManager, View;

TemplateManager = require('./TemplateManager');

module.exports = View = (function() {
  function View() {}

  View.prototype.render = function(templateUrl, params, placement, success) {
    return TemplateManager.get(templateUrl, function(content) {
      var template;
      template = Handlebars.compile(content);
      $(placement).html(template(params));
      if (success) {
        return success();
      }
    });
  };

  return View;

})();

},{"./TemplateManager":18}],21:[function(require,module,exports){

/*
class GDraft
	construct: (slug, commit) ->
	push: (content, commit) ->
	diff: (commit) ->

class GDocument
	construct: (slug, options) ->
	getContent: ->
	getMeta: ->
	createDraft: ->

documentManager =
	documents: [],
	createOrOpen: (slug, options) ->
		 *git branch document-{slug} if not exists
		 *git checkout document-{slug}
		 *
	diff: (slug, v1, v2) ->
	list: ->

repo =
	construct: ->
 */
var AlwaysCtrl, App, DocumentCtrl, DocumentsCtrl, ErrorCtrl, IndexCtrl, LearnMoreCtrl, LogoutCtrl, MediasCtrl;

App = require('./framework/App');

AlwaysCtrl = require('./controllers/AlwaysCtrl');

ErrorCtrl = require('./controllers/ErrorCtrl');

IndexCtrl = require('./controllers/IndexCtrl');

DocumentsCtrl = require('./controllers/DocumentsCtrl');

DocumentCtrl = require('./controllers/DocumentCtrl');

MediasCtrl = require('./controllers/MediasCtrl');

LogoutCtrl = require('./controllers/LogoutCtrl');

LearnMoreCtrl = require('./controllers/LearnMoreCtrl');

$('document').ready(function() {
  var app;
  OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
  app = new App();
  app.initializeRouter({
    '/document/:filename': DocumentCtrl,
    '/': IndexCtrl,
    '/learn-more': LearnMoreCtrl,
    '/learn-more/:doc': LearnMoreCtrl,
    '/404': ErrorCtrl,
    '/403': ErrorCtrl,
    '/documents/:foldername': DocumentsCtrl,
    '/documents': DocumentsCtrl,
    '/medias': MediasCtrl,
    '/logout': LogoutCtrl
  });
  app.event.on('login', function() {
    return $('#user-menu').prepend('<li id="user-avatar" class="auth-needed"><a href="https://github.com/' + app.user.get('login') + '"><img style="margin-top: -15px; position: relative; top: 6px" width="32" src="' + app.user.get('avatar_url') + '" class="img-circle"></a></li>');
  });
  app.event.on('logout', function() {
    return $('#user-avatar').remove();
  });
  return app.setMenu('#menu').setLayout('index').start();
});

},{"./controllers/AlwaysCtrl":2,"./controllers/DocumentCtrl":3,"./controllers/DocumentsCtrl":4,"./controllers/ErrorCtrl":5,"./controllers/IndexCtrl":6,"./controllers/LearnMoreCtrl":7,"./controllers/LogoutCtrl":8,"./controllers/MediasCtrl":9,"./framework/App":10}],22:[function(require,module,exports){
var DocumentManagerService, Service,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

module.exports = DocumentManagerService = (function(_super) {
  __extends(DocumentManagerService, _super);

  function DocumentManagerService(github) {
    var href, res;
    this.github = github;
    this.documents = {};
    href = window.location.href;
    res = href.match(/^http:\/\/([a-zA-Z0-9_-]+).github.io\/([a-zA-Z0-9_-]+)\/.*$/i);
    if (!res) {
      this.repo = this.github.getRepo(config.username, config.repository);
    } else {
      this.repo = this.github.getRepo(res[1], res[2]);
    }
  }

  DocumentManagerService.prototype.checkAccess = function(username, callback) {
    return this.repo.isCollaborator(username, function(err, res) {
      if (res) {
        return callback('collaborator');
      } else {
        if (config["private"]) {
          return callback(false);
        } else {
          return callback('guest');
        }
      }
    });
  };

  DocumentManagerService.prototype.create = function(filename, title, callback) {
    if (!title || !filename || filename === '.md') {
      return callback({
        error: true,
        code: 4,
        msg: 'Filename and title required'
      });
    }
    if (this.documents[filename]) {
      return callback({
        error: true,
        code: 1,
        msg: 'File already exists, please choose another one'
      });
    }
    if (title.length > 70) {
      return callback({
        error: true,
        code: 3,
        msg: 'Title too long'
      });
    }
    if (!filename.match(/^[a-zA-Z0-9-_.\/]+$/i)) {
      return callback({
        error: true,
        code: 2,
        msg: 'The filename should contains alphanumeric characters with `-` or `_` or `.`'
      });
    }
    this.documents[filename] = {
      name: title,
      created: Date.now(),
      path: ''
    };
    return this.repo.write('config', 'documents.json', JSON.stringify(this.root, null, 2), 'Create document ' + filename + ' in documents.json', (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return callback();
      };
    })(this));
  };

  DocumentManagerService.prototype.createFolder = function(name, callback) {
    if (this.documents[name]) {
      return callback({
        error: true,
        code: 1,
        msg: 'File / folder already exists, please choose another one'
      });
    }
    this.documents[name] = {};
    debugger;
    return this.repo.write('config', 'documents.json', JSON.stringify(this.root, null, 2), 'Create folder ' + name + ' in documents.json', (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return callback();
      };
    })(this));
  };

  DocumentManagerService.prototype.release = function(filename, content, message, callback) {
    if (!this.filename) {
      this.parseFilename(filename);
    }
    this.documents[this.filename].updated = Date.now();
    return this.repo.write('config', 'documents.json', JSON.stringify(this.root, null, 2), 'Update draft ' + filename, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write('master', _this.filepath, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.saveDraft = function(filename, content, message, callback) {
    if (!this.filename) {
      this.parseFilename(filename);
    }
    this.documents[this.filename].updated = Date.now();
    return this.repo.write('config', 'documents.json', JSON.stringify(this.root, null, 2), 'Update draft ' + filename, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write('draft', _this.filepath, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.getDocument = function(filename, callback) {
    if (!this.filename) {
      this.parseFilename(filename);
    }
    if (Object.equal(this.documents, {})) {
      return this.repo.read('config', 'documents.json', (function(_this) {
        return function(err, data) {
          var doc, parent, _i, _len, _ref;
          _this.root = JSON.parse(data);
          doc = _this.root;
          _ref = _this.parents;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            parent = _ref[_i];
            doc = doc[parent];
          }
          _this.documents = doc;
          doc = _this.documents[_this.filename];
          return _this.repo.read('draft', _this.filepath, function(err, content) {
            if (!content) {
              content = '';
            }
            return callback(doc, content);
          });
        };
      })(this));
    } else {
      return callback(this.documents[filename]);
    }
  };

  DocumentManagerService.prototype.getReleaseHistory = function(filename, callback) {
    if (!this.filename) {
      this.parseFilename(filename);
    }
    if (!this.documents[this.filename]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.filepath,
      sha: 'master'
    }, callback);
  };

  DocumentManagerService.prototype.getDocumentHistory = function(filename, callback) {
    if (!this.filename) {
      this.parseFilename(filename);
    }
    if (!this.documents[this.filename]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.filepath,
      sha: 'draft'
    }, callback);
  };

  DocumentManagerService.prototype.mergeHistory = function(releaseHistory, documentHistory) {
    var history, v, _i, _j, _len, _len1;
    history = new Array();
    for (_i = 0, _len = releaseHistory.length; _i < _len; _i++) {
      v = releaseHistory[_i];
      v.commit_type = 'release';
    }
    for (_j = 0, _len1 = documentHistory.length; _j < _len1; _j++) {
      v = documentHistory[_j];
      v.commit_type = 'draft';
    }
    history = releaseHistory.add(documentHistory);
    history = history.sortBy((function(elem) {
      return new Date(elem.commit.author.date);
    }), true);
    return history;
  };

  DocumentManagerService.prototype.parseFilename = function(filename) {
    this.filepath = filename;
    this.parents = filename.split('/');
    return this.filename = this.parents.pop();
  };

  DocumentManagerService.prototype.rename = function(filename, newFilename, newName, callback) {
    var doc;
    if (!this.filename) {
      this.parseFilename(filename);
    }
    if (!this.documents[this.filename]) {
      callback('not found', null);
    }
    doc = this.documents[this.filename];
    if (newFilename !== this.filename) {
      if (this.documents[newFilename]) {
        callback('already exists', null);
      }
      this.documents[newFilename] = doc;
      return this.repo.move(filename, newFilename);
    }
  };

  DocumentManagerService.prototype.remove = function(filename, callback) {
    var i, nbCall;
    if (!this.filename) {
      this.parseFilename(filename);
    }
    if (!this.documents[this.filename]) {
      callback('not found', null);
    }
    delete this.documents[this.filename];
    i = 0;
    nbCall = 3;
    this.repo.write('config', 'documents.json', JSON.stringify(this.root, null, 2), 'Remove ' + this.filepath, (function(_this) {
      return function(err) {
        if (callback && ++i === nbCall) {
          return callback(null, true);
        }
      };
    })(this));
    this.repo["delete"]('draft', this.filepath, (function(_this) {
      return function(err) {
        if (err) {
          debugger;
        }
        if (callback && ++i === nbCall) {
          return callback(null, true);
        }
      };
    })(this));
    return this.repo["delete"]('master', this.filepath, (function(_this) {
      return function(err) {
        if (callback && ++i === nbCall) {
          return callback(null, true);
        }
      };
    })(this));
  };

  DocumentManagerService.prototype.getCommit = function(sha, cb) {
    if (!sha) {
      cb('sha needed');
    }
    return this.repo.getCommit(sha, (function(_this) {
      return function(err, commit) {
        if (err) {
          return cb(err);
        }
        return _this.repo.getBlob(commit.files[0].sha, function(err, data) {
          if (err) {
            return cb(err);
          }
          commit.raw = data;
          return cb(null, commit);
        });
      };
    })(this));
  };

  DocumentManagerService.prototype.list = function(foldername, callback) {
    this.parents = new Array();
    if (foldername) {
      this.parents = foldername.split('/');
    }
    return this.repo.read('config', 'documents.json', (function(_this) {
      return function(err, data) {
        var dup, filename, isFile, list, parent, sum, url, _i, _len, _ref;
        console.log(err, data);
        if (!err) {
          _this.root = JSON.parse(data);
          sum = _this.root;
          _ref = _this.parents;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            parent = _ref[_i];
            sum = sum[parent];
          }
          _this.documents = sum;
        } else {
          _this.documents = {};
        }
        list = new Array();
        for (filename in _this.documents) {
          url = ((dup = _this.parents.slice(0)).push(filename) && dup).join('/');
          isFile = filename.match(/.*\.md$/);
          list.push($.extend({
            url: url,
            filename: filename,
            isFile: isFile
          }, _this.documents[filename]));
        }
        if (callback) {
          return callback(err, list);
        }
      };
    })(this));
  };

  return DocumentManagerService;

})(Service);

},{"../framework/Service":17}]},{},[21])