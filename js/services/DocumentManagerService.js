var DocumentManagerService, Service, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

config = require('../config');

module.exports = DocumentManagerService = (function(_super) {
  __extends(DocumentManagerService, _super);

  function DocumentManagerService(github) {
    var res;
    this.github = github;
    this.documents = {};
    res = window.location.href.match(/^http:\/\/([a-zA-Z0-9_-]+).github.io\/([a-zA-Z0-9_-]+)\/.*$/g);
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
    console.log('release', slug, filename, content, message);
    this.documents[slug].updated = Date.now();
    return this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        console.log('documents.json updated', filename, content, message);
        return _this.repo.write('master', filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.saveDraft = function(slug, filename, content, message, callback) {
    console.log('saveDraft', slug, filename, content, message);
    this.documents[slug].updated = Date.now();
    return this.repo.write(slug, 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        console.log('documents.json updated', filename, content, message);
        return _this.repo.write(slug, filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.getDocument = function(slug, callback) {
    console.log('getDocument', slug, this.documents);
    if (Object.equal(this.documents, {})) {
      return this.repo.read('master', 'documents.json', (function(_this) {
        return function(err, data) {
          var doc;
          _this.documents = JSON.parse(data);
          doc = _this.documents[slug];
          return _this.repo.read(slug, doc.filename, function(err, content) {
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
    console.log(releaseHistory, documentHistory);
    history = new Array();
    for (_i = 0, _len = releaseHistory.length; _i < _len; _i++) {
      v = releaseHistory[_i];
      v.imgType = 'img/release-dot.png';
    }
    for (_j = 0, _len1 = documentHistory.length; _j < _len1; _j++) {
      v = documentHistory[_j];
      v.imgType = 'img/draft-dot.png';
    }
    history = releaseHistory.add(documentHistory);
    console.log(history);
    history = history.sortBy((function(elem) {
      return new Date(elem.commit.author.date);
    }), true);
    console.log(history);
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
    console.log('remove document', slug, filename, this.documents);
    this.repo.deleteRef('heads/' + slug, (function(_this) {
      return function(err) {
        if (err) {
          console.log('error updaing documents.json', err);
        }
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
    this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Remove ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          console.log('error updating documents.json', err);
        }
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
    return this.repo.remove('master', filename, (function(_this) {
      return function(err) {
        if (err) {
          console.log('error removing ' + filename, err);
        }
        if (callback && ++i === 3) {
          return callback(null, true);
        }
      };
    })(this));
  };

  DocumentManagerService.prototype.diffToRelease = function(slug, callback) {
    return this.repo.compare('master', slug, callback);
  };

  DocumentManagerService.prototype.diff = function(slug, v1, v2) {};

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
