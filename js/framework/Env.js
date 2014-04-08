var Env;

module.exports = Env = (function() {
  function Env(data) {
    this.data = [];
    if ((data != null ? data.length : void 0) > 0) {
      this.data = data;
    }
  }

  Env.prototype.set = function(key, value) {
    return this.data[key] = value;
  };

  Env.prototype.get = function(key) {
    return this.data[key];
  };

  return Env;

})();
