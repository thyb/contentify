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
          return callback(err, list, _this.root);
        }
      };
    })(this));
  };

  return DocumentManagerService;

})(Service);
