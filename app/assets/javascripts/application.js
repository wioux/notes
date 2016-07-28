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
  props.onload = function(url) {
    // this has the effect of hiding the browser on small screens,
    // while making sure it is shown if the window is expanded
    $("#browser").css("display", "");

    pushState(url);
  }
  props.onfilter = pushState;
  props.ondestroy = function(url) {
    if (url.split("?", 2)[0] == location.pathname)
      pushState("/notes")
  };
  props.onactivate = function() {
    window.scrollTo(0, $("#viewport").offset().top);
  };
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

  $(document).on('submit', '.note form[id^=edit_note_], .note form#new_note', function(e) {
    e.preventDefault();
    app.save();
  });

  $(document).on("click", "#actions a[data-search-action=true]", function(e) {
    e.preventDefault();
    $("#browser").show();
    window.scrollTo(0, 0);
  });

  $(document).on("click", "#actions .navigate a:not([data-search-action])",function(e) {
    e.preventDefault();
    app.load(this.href);
  });

  $(window).on('keydown', function(e) {
    var url;
    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'n':
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        url = $("#actions a[data-new-action]").attr("href");
        url && app.load(url);
      }
      break;

    case 'e':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        url = $("#actions a[data-edit-action]").attr("href");
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
