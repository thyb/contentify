var ModalComponent;

module.exports = ModalComponent = (function() {
  function ModalComponent() {}

  ModalComponent.prototype.initialize = function() {
    return this.settings = {
      "extends": 'div',
      lifecycle: {
        created: function() {}
      },
      accessors: {
        title: {}
      }
    };
  };

  return ModalComponent;

})();
