var contentify;

contentify = null;

(function($) {
  var Contentify;
  Contentify = (function() {
    function Contentify() {
      this.raw = {};
      this.content = {};
    }

    Contentify.prototype.initialize = function(owner, repo, mode) {
      this.owner = owner;
      this.repo = repo;
      return this.mode = mode || 'release';
    };

    Contentify.prototype.clearCache = function(filename) {
      if (filename) {
        delete this.raw[filename];
        return delete this.content[filename];
      } else {
        delete this.raw;
        return delete this.content;
      }
    };

    Contentify.prototype.getBaseUrl = function() {
      return 'https://api.github.com/repos/' + this.owner + '/' + this.repo + '/contents/';
    };

    Contentify.prototype.clearCache = function(filename) {
      if (filename) {
        delete this.raw[filename];
        return delete this.content[filename];
      } else {
        delete this.raw;
        return delete this.content;
      }
    };

    Contentify.prototype.getExtension = function(filename) {
      var res;
      res = filename.match(/[a-zA-Z0-9-_]+\.([a-z]{1,4})/i);
      return res[1];
    };

    Contentify.prototype.getSlug = function(filename) {
      var res;
      res = filename.match(/([a-zA-Z0-9-_]+)\.[a-z]{1,4}/i);
      return res[1];
    };

    Contentify.prototype.getContentRaw = function(filename, callback) {
      var branch;
      if (!filename) {
        return callback('no file');
      }
      if (this.raw[filename]) {
        return callback(null, this.raw[filename]);
      }
      branch = this.mode || 'master';
      if (this.mode === 'release') {
        branch = 'master';
      }
      return $.ajax({
        url: this.getBaseUrl() + filename + "?ref=" + branch,
        headers: {
          'Accept': 'application/vnd.github.V3.raw'
        },
        success: (function(_this) {
          return function(data) {
            _this.raw[filename] = data;
            return callback(null, data);
          };
        })(this)
      });
    };

    Contentify.prototype.compile = function(data) {
      var fragment, match, regexp, res, results, _i, _len;
      regexp = /[^ `]\[\[ ?fragment ([a-zA-Z0-9-_]+) ?\]\]((.*\s*)*?)\[\[ ?\/fragment ?\]\]/gi;
      res = data.match(regexp);
      if (!res) {
        return marked(data);
      }
      results = {};
      regexp = /\[\[ ?fragment ([a-zA-Z0-9-_]+) ?\]\]((.*\s*)*?)\[\[ ?\/fragment ?\]\]/i;
      for (_i = 0, _len = res.length; _i < _len; _i++) {
        fragment = res[_i];
        match = fragment.match(regexp);
        results[match[1]] = marked(match[2].trim());
      }
      return results;
    };

    Contentify.prototype.getContent = function(filename, fragment, callback) {
      var c, f, _i, _len;
      if (!callback) {
        callback = fragment;
        fragment = null;
      }
      if (!filename) {
        return callback("filename null");
      }
      if (this.content[filename]) {
        if (!fragment) {
          return callback(null, this.content[filename]);
        }
        if (typeof fragment === 'string' && this.content[filename][fragment]) {
          return callback(null, this.content[filename][fragment]);
        }
        if ((fragment != null ? fragment.length : void 0) > 0) {
          c = [];
          for (_i = 0, _len = fragment.length; _i < _len; _i++) {
            f = fragment[_i];
            if (this.content[filename][f]) {
              c.push(this.content[filename][f]);
            }
          }
          return callback(null, c);
        }
      }
      return this.getContentRaw(filename, (function(_this) {
        return function(err, data) {
          var _j, _len1;
          if (err || !data) {
            return callback('No data in ' + filename);
          }
          if (_this.getExtension(filename) === 'md') {
            data = _this.compile(data);
          }
          _this.content[filename] = data;
          if (fragment) {
            if (typeof fragment === 'string' && data[fragment]) {
              return callback(null, data[fragment]);
            }
            if (fragment.length > 0) {
              c = [];
              for (_j = 0, _len1 = fragment.length; _j < _len1; _j++) {
                f = fragment[_j];
                if (data[f]) {
                  c.push(data[f]);
                }
              }
              return callback(null, c);
            }
          }
          return callback(null, data);
        };
      })(this));
    };

    return Contentify;

  })();
  contentify = new Contentify();
  return $.fn.includeContent = function(filename, fragment, callback) {
    var defaults, settings;
    defaults = {
      owner: null,
      repo: null,
      filename: null,
      fragment: null
    };
    if (typeof fragment !== 'string') {
      callback = fragment;
      fragment = null;
    }
    settings = $.extend({}, defaults, {
      filename: filename,
      fragment: fragment
    });
    return this.each(function() {
      return contentify.getContent(settings.filename, settings.fragment, (function(_this) {
        return function(err, content) {
          if (err) {
            $(_this).html(error);
          }
          if (!err) {
            $(_this).html(content);
          }
          if (callback) {
            return callback($(_this));
          }
        };
      })(this));
    });
  };
})($);
