
var Viewport = React.createClass({
  componentDidMount: function() {
    var self = this;

    $('.note .body table').tablesorter();

    $('.note input[name*=tag_list]').autocomplete({
      source: '/tags/autocomplete',
      position: { my: 'left bottom', at: 'left top' },
      delay: 0
    });

    if ($(".editor textarea", this.refs.ui)[0]) {
      var source = $(".editor textarea", this.refs.ui).val();
      $(".editor textarea", this.refs.ui).remove();

      var editor = new MediumEditor([$(".editor", this.refs.ui)[0]], {
        autoLink: true,
        buttonLabels: "fontawesome",
        toolbar: {
          buttons: ["h2", "h3", "bold", "italic", "underline", "anchor",
                    "quote", "pre", "abc", "orderedlist", "unorderedlist", "table",
                    "outdent", "indent", "hr"]
        },
        paste: {
          forcePlainText: false,
          cleanPastedHTML: true
        },
        extensions: {
          "abc": new AbcButton(),
          "tables": new MediumEditorTable()
        }
      });

      editor.setContent(source.length ? source : "<p></p>", 0);
      editor.subscribe("editableInput", Note.makeDirty);

      $(".editor", this.refs.ui).focus();

      this.editor = editor
    } else {
      Note.renderAbc();
    }
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
