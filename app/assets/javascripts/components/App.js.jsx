
var App = React.createClass({
  getInitialState: function() {
    return {
      tags: [],
      active: null
    };
  },

  componentDidMount: function() {
    var self = this;
    $("input[type=search]", this.refs.sidebar.refs.filterer).autocomplete({
      source: this.props.autoCompletePath,
      appendTo: this.refs.sidebar.refs.filterer,
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
    this.refs.sidebar.filter(f, cb);
  },

  edit: function() {
    if (!this.state.active)
      return;

    var url = this.state.active.url.split("?", 2)[0];
    if (url.match(/\/edit$/))
      this.load(url.replace(/\/edit$/, ""));
    else
      this.load(url + "/edit");
  },

  save: function() {
    if (!this.state.active)
      return;

    var self = this;
    var form = $("form", this.refs.viewport.refs.ui);
    Note.submit(form, function(resp) {
      R = resp;
      self.load(resp.url);
      self.refs.sidebar.refresh();
    });
  },

  load: function(url, callbacks) {
    if (this.hasUnsavedChanges() && !confirm('There are unsaved changes. Really navigate away?'))
      return this.props["onload"](this.state.active.url.split("?", 2)[0]);

    var self = this;
    $.get(url, function(html) {
      var id = url.split("?", 2)[0].match(/([^\/]+\/[^\/]+)(\/edit)?$/)[1];
      self.refs.sidebar.setState({ active : id });
      self.setState({
        active: {
          id: id,
          url: url,
          html: $(html).find("#content").html()
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
      success: callback
    });
  },

  render: function() {
    return (
      <div id="app">
        <Sidebar ref="sidebar"
                 searchPath={this.props.searchPath}
                 activate={this.load}
                 destroy={this.destroy} />
        <Viewport ref="viewport"
                  id={this.state.active ? this.state.active.id : null}
                  html={this.state.active ? this.state.active.html : null} />
      </div>
    );
  }
});
