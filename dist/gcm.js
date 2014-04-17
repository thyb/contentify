(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DocumentHistory;

module.exports = DocumentHistory = (function() {
  function DocumentHistory(initialHistory, me) {
    var hist, _i, _len;
    this.me = me;
    this.current = 0;
    this.history = [];
    this.listeners = {};
    for (_i = 0, _len = initialHistory.length; _i < _len; _i++) {
      hist = initialHistory[_i];
      this.history.push({
        sha: hist.sha,
        version_type: hist.commit_type,
        message: hist.commit.message,
        login: hist.author.login,
        avatar_url: hist.author.avatar_url
      });
    }
    this.generateTemplate();
  }

  DocumentHistory.prototype.add = function(hist) {
    this.history.unshift({
      sha: hist.sha,
      version_type: hist.commit_type,
      message: hist.commit.message,
      login: hist.author.login,
      avatar_url: hist.author.avatar_url
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
          _this.change(ind);
          return _this.listeners['select'].each(function(fct) {
            return fct(_this.history[ind], ind);
          });
        }
      };
    })(this));
  };

  DocumentHistory.prototype.change = function(index) {
    this.current = index;
    this.container.find('p.active').removeClass('active');
    return this.container.find('p:eq(' + index.toString() + ')').addClass('active');
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
module.exports = {
  repository: 'content',
  username: 'thyb',
  firebase_key: "fiery-fire-8126",
  algolia_key: ""
};

},{}],3:[function(require,module,exports){
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

},{"../framework/Ctrl":11}],4:[function(require,module,exports){
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

},{"../components/DocumentHistory":1,"../framework/Ctrl":11,"../services/DocumentManagerService":23}],5:[function(require,module,exports){
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
    if (!this.app.user.isAuth()) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.user.github);
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

},{"../config":2,"../framework/Ctrl":11,"../services/DocumentManagerService":23}],6:[function(require,module,exports){
var Ctrl, ErrorCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = ErrorCtrl = (function(_super) {
  __extends(ErrorCtrl, _super);

  function ErrorCtrl() {
    return ErrorCtrl.__super__.constructor.apply(this, arguments);
  }

  ErrorCtrl.prototype["do"] = function() {};

  return ErrorCtrl;

})(Ctrl);

},{"../framework/Ctrl":11}],7:[function(require,module,exports){
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
    return $('button').click((function(_this) {
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
var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager, User, config;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

User = require('./User');

config = require('../config');

module.exports = App = (function() {
  function App() {
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

},{"../config":2,"./CtrlManager":13,"./Env":14,"./GlobalEvent":15,"./LayoutManager":16,"./Router":17,"./TemplateManager":19,"./User":20}],11:[function(require,module,exports){
var Ctrl, CtrlEvent, View;

CtrlEvent = require('./CtrlEvent');

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
    this.event = new CtrlEvent();
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

  Ctrl.prototype.unload = function() {
    if (this._askedForRedirect) {
      return $(window).unbind('beforeunload');
    }
  };

  return Ctrl;

})();

},{"./CtrlEvent":12,"./View":21}],12:[function(require,module,exports){
var CtrlEvent;

module.exports = CtrlEvent = (function() {
  function CtrlEvent() {
    this.listeners = [];
  }

  CtrlEvent.prototype.emit = function(name, value) {
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

  CtrlEvent.prototype.receive = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return CtrlEvent;

})();

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
    masterParams = new Array();
    for (route in this._routes) {
      if (route.indexOf('/:') !== -1) {
        res = route.match(/\/:([a-zA-Z0-9]+)/);
        res.shift();
        params = res;
        regexpStr = route.replace(/\/:[a-zA-Z0-9]+/g, '/([a-zA-Z0-9_-]+)').replace(/\//g, '\\/');
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

},{"./View":21}],18:[function(require,module,exports){
var Service;

module.exports = Service = (function() {
  function Service() {}

  return Service;

})();

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./TemplateManager":19}],22:[function(require,module,exports){

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
var AlwaysCtrl, App, DocumentCtrl, DocumentsCtrl, ErrorCtrl, IndexCtrl, LogoutCtrl, MediasCtrl;

App = require('./framework/App');

AlwaysCtrl = require('./controllers/AlwaysCtrl');

ErrorCtrl = require('./controllers/ErrorCtrl');

IndexCtrl = require('./controllers/IndexCtrl');

DocumentsCtrl = require('./controllers/DocumentsCtrl');

DocumentCtrl = require('./controllers/DocumentCtrl');

MediasCtrl = require('./controllers/MediasCtrl');

LogoutCtrl = require('./controllers/LogoutCtrl');

$('document').ready(function() {
  var app;
  OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
  app = new App();
  app.initializeRouter({
    '/document/:slug': DocumentCtrl,
    '/': IndexCtrl,
    '/404': ErrorCtrl,
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

},{"./controllers/AlwaysCtrl":3,"./controllers/DocumentCtrl":4,"./controllers/DocumentsCtrl":5,"./controllers/ErrorCtrl":6,"./controllers/IndexCtrl":7,"./controllers/LogoutCtrl":8,"./controllers/MediasCtrl":9,"./framework/App":10}],23:[function(require,module,exports){
var DocumentManagerService, Service, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

config = require('../config');

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

  DocumentManagerService.prototype.create = function(params, callback) {
    if (this.documents[params.slug]) {
      return callback({
        error: true,
        code: 1,
        msg: 'Slug already exists, please choose another one'
      });
    }
    if (params.extension !== 'md' && params.extension !== 'html') {
      return callback({
        error: true,
        code: 2,
        msg: 'Unknown extension'
      });
    }
    if (params.name.length > 70) {
      return callback({
        error: true,
        code: 3,
        msg: 'Name too long'
      });
    }
    this.documents[params.slug] = {
      name: params.name,
      extension: params.extension,
      created: Date.now(),
      path: '',
      filename: params.slug + '.' + params.extension
    };
    return this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Create document ' + params.slug + ' in documents.json', (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.branch(params.slug, function(err) {
          if (err) {
            return callback(err);
          }
          return callback();
        });
      };
    })(this));
  };

  DocumentManagerService.prototype.release = function(slug, filename, content, message, callback) {
    this.documents[slug].updated = Date.now();
    return this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write('master', filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.saveDraft = function(slug, filename, content, message, callback) {
    this.documents[slug].updated = Date.now();
    return this.repo.write(slug, 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write(slug, filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.getDocument = function(slug, callback) {
    if (Object.equal(this.documents, {})) {
      return this.repo.read('master', 'documents.json', (function(_this) {
        return function(err, data) {
          var doc;
          _this.documents = JSON.parse(data);
          doc = _this.documents[slug];
          return _this.repo.read(slug, doc.filename, function(err, content) {
            if (!content) {
              content = '';
            }
            return callback(doc, content);
          });
        };
      })(this));
    } else {
      return callback(this.documents[slug]);
    }
  };

  DocumentManagerService.prototype.getReleaseHistory = function(slug, callback) {
    if (!this.documents[slug]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.documents[slug].filename,
      sha: 'master'
    }, callback);
  };

  DocumentManagerService.prototype.getDocumentHistory = function(slug, callback) {
    if (!this.documents[slug]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.documents[slug].filename,
      sha: slug
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

  DocumentManagerService.prototype.remove = function(slug, callback) {
    var filename, i;
    if (!this.documents[slug]) {
      callback('not found', null);
    }
    filename = this.documents[slug].filename;
    delete this.documents[slug];
    i = 0;
    this.repo.deleteRef('heads/' + slug, (function(_this) {
      return function(err) {
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
    this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Remove ' + slug, (function(_this) {
      return function(err) {
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
    return this.repo["delete"]('master', filename, (function(_this) {
      return function(err) {
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
  };

  DocumentManagerService.prototype.getCommit = function(sha, cb) {
    if (sha) {
      return this.repo.getCommit(sha, cb);
    }
  };

  DocumentManagerService.prototype.list = function(callback) {
    return this.repo.read('master', 'documents.json', (function(_this) {
      return function(err, data) {
        var list, slug;
        if (!err) {
          _this.documents = JSON.parse(data);
        } else {
          _this.documents = {};
        }
        list = new Array();
        for (slug in _this.documents) {
          list.push($.extend({
            slug: slug
          }, _this.documents[slug]));
        }
        if (callback) {
          return callback(err, list);
        }
      };
    })(this));
  };

  return DocumentManagerService;

})(Service);

},{"../config":2,"../framework/Service":18}]},{},[22])