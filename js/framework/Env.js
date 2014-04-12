var Env;

module.exports = Env = (function() {
  var data;

  data = {};

  function Env() {
    if (localStorage) {
      console.log('has local storage');
      try {
        data = JSON.parse(localStorage.getItem('env'));
      } catch (_error) {}
      if (!data) {
        data = {};
      }
    }
    console.log(data);
  }

  Env.prototype.set = function(key, value) {
    console.log('env set', key, value);
    data[key] = value;
    console.log(data);
    if (localStorage) {
      console.log('set localstorage to', data);
      return localStorage.setItem('env', JSON.stringify(data));
    }
  };

  Env.prototype.get = function(key) {
    return data[key];
  };

  return Env;

})();
