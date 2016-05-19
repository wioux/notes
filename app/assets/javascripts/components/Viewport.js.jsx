
var Viewport = React.createClass({
  componentDidMount: function() {
    var self = this;

    $('.note .body table').tablesorter();

    $('.note input[name*=tag_list]').autocomplete({
      source: '/tags/autocomplete',
      position: { my: 'left bottom', at: 'left top' },
      delay: 0
    });

    if ($(".editor textarea:visible", this.refs.ui)[0]) {
      var source = $(".editor textarea:visible", this.refs.ui).val();
      $(".editor textarea:visible", this.refs.ui).css("display", "none");

      var editor = new ProseMirror({
        place: $(".editor", this.refs.ui)[0],
        doc: source, docFormat: "markdown",
        menuBar: true
      });

      editor.on("transform", function() {
        if (editor.history.undoDepth)
          Note.makeDirty();
        else
          Note.makeClean();
      });

      editor.focus();

      this.editor = editor
    }

    Note.renderAbc();
  },

  componentDidUpdate: function() {
    this.componentDidMount();
  },

  getHtml: function() {
    return {__html: this.props.html ? this.props.html : ""};
  },

  render: function() {
    return (
      <div id="viewport" className="col-md-8">
        <div id="content" ref="ui" dangerouslySetInnerHTML={this.getHtml()} />
      </div>
    );
  }
});
