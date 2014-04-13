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
