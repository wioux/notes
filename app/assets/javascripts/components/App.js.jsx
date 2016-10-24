
var App = React.createClass({
  componentDidMount: function() {
    var self = this;
    $(this.refs.browser.refs.filter).autocomplete({
      source: this.props.autoCompletePath,
      appendTo: this.refs.browser.refs.filter.parentNode,
      delay: 0,

      select: function(e, select) {
        self.refs.browser.filter(select.item.value);
      }
    });

    $(window).bind("beforeunload", function() {
      if (self.hasUnsavedChanges())
        return "There are unsaved changes.";
    });

    $(this.refs.browser.refs.ui)
      .on("click", "a[data-tag]", function(e) {
        if (!e.metaKey) {
          e.preventDefault();
          self.refs.browser.filter("."+this.dataset.tag);
        }
      })
      .on("submit", "form[id^=edit_note_],form#new_note", function(e) {
        e.preventDefault();
        self.save();
      })
      .on("click", ".browser-app-actions a[data-search-action=true]", function(e) {
        e.preventDefault();
        $("#browser").show();
        window.scrollTo(0, 0);
      })
      .on("click", ".browser-app-actions .navigate a:not([data-search-action])", function(e) {
        e.preventDefault();
        self.load(this.href);
      })
      .on("click", ".browser-app-results .actions .destroyer", function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.destroy($(this).closest("li")[0]);
      });

    this.onViewportLoad();
  },

  getDefaultProps: function() {
    return {
      onLoad: function() {}
    }
  },

  hasUnsavedChanges: function() {
    return !!$("form.hasUnsavedChanges", this.refs.browser.refs.ui).length;
  },

  save: function() {
    var self = this;
    var form = $(".browser-app-viewport-content form", this.refs.browser.refs.ui);
    var create = (form.attr("id") || "").match(/^new_/);
    Note.submit(this, form[0], function(resp) {
      if (create)
        self.load(resp.url);
      self.refs.browser.refreshFilter();
    });
  },

  destroy: function(ui) {
    var preview = $(ui).find(".preview").text();
    var url = $(ui).find(".destroyer").attr("href");

    if (!confirm("Confirm to destroy:\n\n" + preview))
      return;

    var self = this;
    $.ajax({
      method: "post",
      data: { "_method": "delete" },
      url: url,

      success: function() {
        self.props.onDestroy(url);
        $(ui).css("position", "relative").
          animate({left: -$(ui).width()}, "slow", function() {
            var newResults = self.refs.browser.state.results
              .filter(function(i) { return i.url != url });
            self.refs.browser.setState({ results: newResults });
          });
      }
    });
  },

  checkForUnsavedChanges: function() {
    if (this.hasUnsavedChanges() && !confirm("There are unsaved changes. Really navigate away?"))
      return false;
  },

  load: function(url) {
    var id = url.split("?", 2)[0].match(/([^\/]+\/[^\/]+)(\/edit)?$/);
    id = id ? id[1] : url.split("?", 2)[0].match(/[^\/]*$/)[0];
    id = id.split("#", 2)[0];

    this.refs.browser.setViewport(url, id, true);
  },

  onViewportLoad: function() {
    $(".note input[name*=tag_list]").autocomplete({
      source: "/tags/autocomplete",
      position: { my: "left bottom", at: "left top" },
      delay: 0
    });

    if ($(".editor textarea", this.refs.browser.refs.ui)[0]) {
      var source = $(".editor textarea", this.refs.ui).val();
      $(".editor textarea", this.refs.ui).remove();

      var frag = document.createElement("div");
      frag.innerHTML = source;


      var editor = new ProseMirror({
        menuBar: true,
        place: $(".editor", this.refs.browser.refs.ui)[0],
        schema: ProseMirrorSchema,
        doc: ProseMirrorSchema.parseDOM(frag),
        plugins: ProseMirrorPlugins
      });

      editor.on.transform.add(function() {
        if (editor.history.undoDepth)
          Note.makeDirty();
        else
          Note.makeClean();
      });

      editor.focus();

      this.editor = editor;
    } else {
      Note.renderAbc();
    }

    this.props.onLoad.apply(window, arguments);
  },

  render: function() {
    return (
      <BrowserApp ref="browser" {...this.props}
                  resultTag="FilterResult"
                  onLoad={ this.onViewportLoad }
                  onUnload={ this.checkForUnsavedChanges } />
    );
  }
});
