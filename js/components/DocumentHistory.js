var DocumentHistory;

module.exports = DocumentHistory = (function() {
  function DocumentHistory(initialHistory, me) {
    var hist, _i, _len;
    this.me = me;
    this.current = 0;
    this.history = [];
    for (_i = 0, _len = initialHistory.length; _i < _len; _i++) {
      hist = initialHistory[_i];
      this.history.unshift({
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
      return this.container.find('p:first').remove();
    }
  };

  DocumentHistory.prototype.on = function(event, callback) {
    if (event === 'select') {
      return callback();
    }
  };

  DocumentHistory.prototype.renderElement = function(index) {
    var elem;
    elem = this.history[index];
    this.container.prepend(this.template(elem));
    if (index === this.current) {
      this.container.find('p.active').removeClass('active');
      return this.container.find('p:eq(' + index + ')').addClass('active');
    }
  };

  DocumentHistory.prototype.render = function(container) {
    var i, _results;
    this.container = container;
    this.container.html('');
    _results = [];
    for (i in this.history) {
      _results.push(this.renderElement(i));
    }
    return _results;
  };

  DocumentHistory.prototype.generateTemplate = function() {
    var content;
    content = '<p><img width="42" height="42" title="{{login}}" class="img-circle {{version_type}}" src="{{avatar_url}}"><span>{{message}}</span></p>';
    return this.template = Handlebars.compile(content);
  };

  return DocumentHistory;

})();
