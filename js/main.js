var GDocument, GDraft, app, documentManager, repo, view;

app = {
  state: "/",
  github: null,
  auth: false
};

GDraft = (function() {
  function GDraft() {}

  GDraft.prototype.construct = function(slug, commit) {};

  GDraft.prototype.push = function(content, commit) {};

  GDraft.prototype.diff = function(commit) {};

  return GDraft;

})();

GDocument = (function() {
  function GDocument() {}

  GDocument.prototype.construct = function(slug, options) {};

  GDocument.prototype.getContent = function() {};

  GDocument.prototype.getMeta = function() {};

  GDocument.prototype.createDraft = function() {};

  return GDocument;

})();

documentManager = {
  documents: [],
  createOrOpen: function(slug, options) {},
  diff: function(slug, v1, v2) {},
  list: function() {}
};

repo = {
  construct: function() {}
};

view = {
  render: function(template, params, placement) {
    if (!placement) {
      placement = params;
      params = {};
    }
    return $.get(template, params, function(data) {
      template = Handlebars.compile(data);
      return $('body').html(template());
    });
  }
};

$('document').ready(function() {
  OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
  return $('button').click(function() {
    return OAuth.popup('github', function(err, res) {
      if (err) {
        return console.log(err);
      }
      console.log(res);
      app.github = new Github({
        token: res.access_token,
        auth: 'oauth'
      });
      return view.render('/tmpl/main/dashboard.html', 'body');
    });
  });
});
