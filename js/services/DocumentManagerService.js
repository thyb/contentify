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
