var TemplateManager, View;

TemplateManager = require('./TemplateManager');

module.exports = View = (function() {
  function View() {}

  View.prototype.render = function(templateUrl, params, placement, success) {
    return TemplateManager.get(templateUrl, function(content) {
      var template;
      template = Handlebars.compile(content);
      $(placement).html(template(params));
      if (success) {
        return success();
      }
    });
  };

  return View;

})();
