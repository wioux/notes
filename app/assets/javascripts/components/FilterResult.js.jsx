(function() {
  var tagColors = ["#a00", "#050", "#00f"];

  var tagColorI = 1;
  var getColor = function() {
    return tagColors[tagColorI++ % tagColors.length];
  };

  window.FilterResult = React.createClass({
    render: function() {
      var colorize = function(tag, i) {
        var t = <span key={tag.id}
                      className="tag"
                      style={{color: getColor(i)}}>
                  {tag.short_label}
                </span>;
        return i > 0 ? [", ", t] : t;
      };

      return (
        <div>
          <span className="preview">
            <a href={this.props.url}>{this.props.preview}</a>
          </span>
          <span className="actions btn-group">
            <a className="btn btn-default btn-xs destroyer"
               href={this.props.url} onClick={this.destroy}>
              destroy
            </a>
          </span>
  
          {this.props.tags.map(colorize)}
        </div>
      );
    }
  });

})();
