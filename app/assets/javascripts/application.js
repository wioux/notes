//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require bootstrap
//= require abcjs-rails
//= require react
//= require react_ujs
//= require components
//= require_tree ../../../vendor/assets/javascripts
//= require_tree .

function pushState(url) {
  url = url || location.pathname;
  if (app.refs.browser.state.filter.match(/\S/))
    url += "?f="+encodeURIComponent(app.refs.browser.state.filter);
  window.history.pushState({}, '', url);
}

function popState() {
  var f = "";
  (location.search || "?f=").substr(1).split("&").forEach(function(param) {
    var kv = param.split("=", 2);
    if (kv[0] == "f")
      f = decodeURIComponent(kv[1]);
  });

  if (f != app.refs.browser.state.filter)
    app.filter(f, false);

  if (location.pathname != "/")
    app.load(location.href, false);
}

$(document).ready(function() {
  var props = $("#app_container *").data("reactProps");
  props.onload = pushState;
  props.onfilter = pushState;
  window.onpopstate = popState;

  window.app = ReactDOM.render(React.createElement(App, props),
                               $('#app_container *')[0]);

  $(window).bind('beforeunload', function() {
    if (app.hasUnsavedChanges())
      return 'There are unsaved changes.';
  });

  $(document).on('click', 'a[data-tag]', function(e) {
    if (!e.metaKey) {
      e.preventDefault();
      app.filter("."+this.dataset.tag);
    }
  });

  $(document).on('submit', '.note form', function(e) {
    e.preventDefault();
    app.save();
  });

  $(document).on("click", "#item_actions a", function(e) {
    e.preventDefault();
    app.load(this.href);
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
});
