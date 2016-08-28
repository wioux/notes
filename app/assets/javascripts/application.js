//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require bootstrap
//= require abcjs-rails
//= require react
//= require react_ujs
//= require_tree ../../../vendor/assets/javascripts
//= require components
//= require_tree .

function pushState(url, filter) {
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
  props.onLoad = function(url) {
    // this has the effect of hiding the browser on small screens,
    // while making sure it is shown if the window is expanded
    $("#browser").css("display", "");

    pushState(url);
  };

  props.onDestroy = function(url) {
    if (url.split("?", 2)[0] == location.pathname)
      pushState("/notes")
  };

  props.onSelect = function() {
//    window.scrollTo(0, $("#viewport").offset().top);
  };

  props.onFilter = function(search) { pushState() }

  window.onpopstate = popState;

  window.app = ReactDOM.render(React.createElement(App, props),
                               $('#app_container *')[0]);

  $(window).on('keydown', function(e) {
    var url;
    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'n':
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        url = $(".browser-app-actions a[data-new-action]").attr("href");
        url && app.load(url);
      }
      break;

    case 'e':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        url = $(".browser-app-actions a[data-edit-action]").attr("href");
        url && app.load(url);
      }
      break;

    case 's':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        app.save();
      }
      break;
    }
  });
});
