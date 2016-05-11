
Browser = {
  focus: function() {
    $('#filterer input').focus().select();
  }
};

$(document).ready(function() {
  $("body").empty().append('<div id="app_container">');

  var app;
  var pushstate = function(url) {
    url = url || location.pathname;
    if (app.refs.sidebar.state.filter.match(/\S/))
      url += "?f="+encodeURIComponent(app.refs.sidebar.state.filter);
    window.history.pushState({}, '', url);
  };

  var initialize = true;
  var popstate = function() {
    var f = "";
    (location.search || "?f=").substr(1).split("&").forEach(function(param) {
      var kv = param.split("=", 2);
      if (kv[0] == "f")
        f = decodeURIComponent(kv[1]);
    });

    if (f != app.refs.sidebar.state.filter || initialize)
      app.filter(f, false);

    if (location.pathname != "/")
      app.load(location.href, false);

    initialize = false;
  };

  var props = {
    searchPath: "/notes.json",
    autoCompletePath: "/autocomplete",
    onload: pushstate,
    onfilter: pushstate
  };
  app = ReactDOM.render(React.createElement(App, props),
                        $('#app_container')[0]);

  $(document).on('click', 'a[data-tag]', function(e) {
    if (!e.metaKey) {
      e.preventDefault();
      app.filter("."+this.dataset.tag);
    }
  });

  $(window).on('keydown', function(e) {
    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'n':
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        app.load('/notes/new');
      }
      break;

    case 'i':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        Viewer.inspect();
      }
      break;

    case 'e':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        app.edit();
      }
      break;

    case 's':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        app.save();
      } else if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        Browser.focus();
      }
      break;
    }
  });

  window.onpopstate = popstate;
  popstate();

  $(window).bind('beforeunload', function() {
    if (app.hasUnsavedChanges())
      return 'There are unsaved changes.';
  });

  window.app = app;
});
