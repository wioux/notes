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
    $("#browser").show();
    window.scrollTo(0, 0);
  });

  $(document).on("click", "#actions .navigate a", function(e) {
    e.preventDefault();
    app.load(this.href);
  });

  $(document).on("click", "#actions .navigate a[data-edit-action], #actions .navigate a[data-new-action]", function(e) {
    // looking at a[data-search-action] here is lazy...
    if ($("#actions a[data-search-action=true]").is(":visible"))
      $("#browser").hide();
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
