
var Viewport = React.createClass({
  componentDidMount: function() {
    $('.note .body table').tablesorter();

    $('.note .edit input[name*=tag_list]').autocomplete({
      source: '/tags/autocomplete',
      position: { my: 'left bottom', at: 'left top' },
      delay: 0
    });

    $('.note textarea').focus();

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
      <div id="viewport" className="row">
        <div className="col-md-3" />
        <div id="content" ref="ui" className="col-md-8"
             dangerouslySetInnerHTML={this.getHtml()} />
      </div>
    );
  }
});
