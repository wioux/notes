
Browser = {
  focus: function() {
    $('#filterer input').focus().select();
  }
};

$(document).ready(function() {
  var app;
  var pushstate = function(url) {
    url = url || location.pathname;
    if (app.refs.sidebar.state.filter.match(/\S/))
      url += "?f="+encodeURIComponent(app.refs.sidebar.state.filter);
    window.history.pushState({}, '', url);
  };

  var popstate = function() {
    var f = "";
    (location.search || "?f=").substr(1).split("&").forEach(function(param) {
      var kv = param.split("=", 2);
      if (kv[0] == "f")
        f = decodeURIComponent(kv[1]);
    });

    if (f != app.refs.sidebar.state.filter)
      app.filter(f, false);

    if (location.pathname != "/")
      app.load(location.href, false);
  };

  var props = $("#app_container *").data("reactProps");
  props.onload = pushstate;
  props.onfilter = pushstate;
  app = ReactDOM.render(React.createElement(App, props),
                        $('#app_container *')[0]);

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

  $(window).bind('beforeunload', function() {
    if (app.hasUnsavedChanges())
      return 'There are unsaved changes.';
  });

  window.app = app;
});
