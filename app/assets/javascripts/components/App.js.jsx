
var App = React.createClass({
  getInitialState: function() {
    return {
      active: this.props.initialActive
    };
  },

  componentDidMount: function() {
    var self = this;
    $("input[type=search]", this.refs.browser.refs.filterer).autocomplete({
      source: this.props.autoCompletePath,
      appendTo: this.refs.browser.refs.filterer,
      delay: 0,

      open: function(e, ui) {
        if (!$(this).parents('.filter_mode')[0])
          $(this).autocomplete('close');
      },

      select: function(e, select) {
        self.filter(select.item.value);
      }
    });
  },

  hasUnsavedChanges: function() {
    return !!$("form.hasUnsavedChanges", this.refs.viewport.refs.ui).length;
  },

  filter: function(f, callbacks) {
    var cb = callbacks === undefined ? this.props.onfilter : undefined;
    this.refs.browser.filter(f, cb);
  },

  edit: function() {
    var url = this.state.active.url.split("?", 2)[0];
    if (url.match(/\/(edit|new)$/))
      this.load(url.replace(/\/(edit|new)$/, ""));
    else
      this.load(url + "/edit");
  },

  save: function() {
    var self = this;
    var viewport = this.refs.viewport;
    var create = $("form", viewport.refs.ui).attr("id").match(/^new_/);
    Note.submit(viewport, function(resp) {
      if (create)
        self.load(resp.url);
      self.refs.browser.refresh();
    });
  },

  load: function(url, callbacks) {
    if (this.hasUnsavedChanges() && !confirm('There are unsaved changes. Really navigate away?'))
      return this.props["onload"](this.state.active.url.split("?", 2)[0]);

    var self = this;
    $.get(url, function(html) {
      var id = url.split("?", 2)[0].match(/([^\/]+\/[^\/]+)(\/edit)?$/);
      id = id ? id[1] : url.split("?", 2)[0].match(/[^\/]+$/)[0];
      self.refs.browser.setState({ active : id });
      self.setState({
        active: {
          id: id,
          url: url,
          html: html
        }
      });
      if (callbacks !== false)
        self.props["onload"](url.split("?", 2)[0]);
    });
  },

  destroy: function(url, callback) {
    var self = this;
    $.ajax({
      method: "post",
      data: { "_method": "delete" },
      url: url,
      success: function() {
        self.props.ondestroy(url);
        callback && callback();
      }
    });
  },

  render: function() {
    return (
      <div id="app">
        <Browser ref="browser"
                 initialTags={this.props.initialTags}
                 initialFilters={this.props.initialFilters}
                 initialFilter={this.props.initialFilter}
                 initialResults={this.props.initialResults}
                 initialActive={this.state.active.id}
                 searchPath={this.props.searchPath}
                 search={this.props.onfilter}
                 activate={this.load}
                 destroy={this.destroy} />
        <Viewport ref="viewport"
                  id={this.state.active.id}
                  html={this.state.active.html} />
      </div>
    );
  }
});
