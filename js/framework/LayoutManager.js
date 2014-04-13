var LayoutManager;

module.exports = LayoutManager = (function() {
  var Layout, baseUrl, layout, layouts;

  function LayoutManager() {}

  layouts = {};

  layout = null;

  baseUrl = './tmpl/layout/';

  Layout = (function() {
    function Layout(template) {
      this.template = template;
    }

    Layout.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template + '.html',
        type: "get"
      }).done((function(_this) {
        return function(content) {
          _this.content = content;
          if (callback) {
            return callback(content);
          }
        };
      })(this));
    };

    return Layout;

  })();

  LayoutManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  LayoutManager.set = function(l, callback) {
    layout = l;
    if (layouts[layout] == null) {
      layouts[layout] = new Layout(layout);
    }
    return layouts[layout].getContent((function(_this) {
      return function(content) {
        $('body').html(content);
        return callback();
      };
    })(this));
  };

  return LayoutManager;

})();
