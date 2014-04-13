var CtrlManager;

module.exports = CtrlManager = (function() {
  function CtrlManager(app) {
    this.app = app;
    this.partials = [];
  }

  CtrlManager.prototype.setMaster = function(ctrl, params, callback) {
    if (this.master) {
      this.master.unload();
    }
    this.master = new ctrl(this.app, params);
    console.log(this.app.router.stop, params.path);
    if (this.app.router.stop && this.app.router.stop !== params.path) {
      return (this.app.router.stop = false);
    }
    return this.master.use(callback);
  };

  CtrlManager.prototype.addPartial = function(ctrl, placement, callback) {
    this.partials.push({
      ctrl: new ctrl(this.app, {
        placement: placement
      })
    });
    return this.partials[this.partials.length - 1].ctrl.use(callback);
  };

  CtrlManager.prototype.removePartial = function(ctrl, placement) {
    var partial;
    for (partial in this.partials) {
      if (partials[partial].placement === placement) {
        delete partials[partial];
      }
    }
    return $(placement).html('');
  };

  return CtrlManager;

})();
