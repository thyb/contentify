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
    return this.repo.write('config', 'documents.json', JSON.stringify(this.documents, null, 2), 'Create document ' + filename + ' in documents.json', (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return callback();
      };
    })(this));
  };

  DocumentManagerService.prototype.release = function(filename, content, message, callback) {
    this.documents[filename].updated = Date.now();
    return this.repo.write('config', 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + filename, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write('master', filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.saveDraft = function(filename, content, message, callback) {
    this.documents[filename].updated = Date.now();
    return this.repo.write('config', 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + filename, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.write('draft', filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.getDocument = function(filename, callback) {
    if (Object.equal(this.documents, {})) {
      return this.repo.read('config', 'documents.json', (function(_this) {
        return function(err, data) {
          var doc;
          _this.documents = JSON.parse(data);
          doc = _this.documents[filename];
          return _this.repo.read('draft', filename, function(err, content) {
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
    if (!this.documents[filename]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: filename,
      sha: 'master'
    }, callback);
  };

  DocumentManagerService.prototype.getDocumentHistory = function(filename, callback) {
    if (!this.documents[filename]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: filename,
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

  DocumentManagerService.prototype.rename = function(filename, newFilename, newName, callback) {
    var doc;
    if (!this.documents[filename]) {
      callback('not found', null);
    }
    doc = this.documents[filename];
    if (newFilename !== filename) {
      if (this.documents[newFilename]) {
        callback('already exists', null);
      }
      this.documents[newFilename] = doc;
      return this.repo.move(filename, newFilename);
    }
  };

  DocumentManagerService.prototype.remove = function(filename, callback) {
    var i, nbCall;
    if (!this.documents[filename]) {
      callback('not found', null);
    }
    delete this.documents[filename];
    i = 0;
    nbCall = 3;
    this.repo.write('config', 'documents.json', JSON.stringify(this.documents, null, 2), 'Remove ' + filename, (function(_this) {
      return function(err) {
        if (callback && ++i === nbCall) {
          return callback(null, true);
        }
      };
    })(this));
    this.repo["delete"]('draft', filename, (function(_this) {
      return function(err) {
        if (callback && ++i === nbCall) {
          return callback(null, true);
        }
      };
    })(this));
    return this.repo["delete"]('master', filename, (function(_this) {
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

  DocumentManagerService.prototype.list = function(callback) {
    return this.repo.read('config', 'documents.json', (function(_this) {
      return function(err, data) {
        var filename, list;
        console.log(err, data);
        if (!err) {
          _this.documents = JSON.parse(data);
        } else {
          _this.documents = {};
        }
        list = new Array();
        for (filename in _this.documents) {
          list.push($.extend({
            filename: filename
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
