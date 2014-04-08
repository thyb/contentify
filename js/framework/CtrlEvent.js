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
