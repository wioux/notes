
var Browser = React.createClass({
  getInitialState: function() {
    return {
      tags: this.props.initialTags || [],
      filters: this.props.initialFilters || [],
      filter: this.props.initialFilter || "",
      results: this.props.initialResults || [],
      active: this.props.initialActive || null
    };
  },

  onInputChange: function(e) {
    this.setState({ filter: e.target.value });
  },

  focus: function() {
    $("input[type=search]", this.refs.filterer).focus().select();
  },

  destroy: function(item, ui) {
    if (!confirm("Confirm to destroy:\n\n" + item.props.preview))
      return;

    var self = this;
    this.props.destroy(item.props.url, function() {
      $(ui).css('position', 'relative').
        animate({left: -$(ui).width()}, 'slow', function() {
          var newResults = self.state.results
              .filter(function(i) { return i.url != item.props.url });
          self.setState({ results: newResults });
        });
    });
  },

  clearFilter: function(e) {
    e && e.preventDefault();
    this.filter("", this.focus);
  },

  refresh: function(e) {
    e && e.preventDefault();
    this.filter(this.state.filter);
  },

  filter: function(f, callback) {
    var self = this;
    $.get(this.props.searchPath+".json?f="+f, function(resp) {
      self.setState({ filter: f, results: resp.results, tags: resp.tags });
      callback && callback.call(self);
    });
  },

  render: function() {
    var savedFilter = function(filter) {
      return <a href={"?"+f.value} className="btn btn-default btn-xs">{filter.name}</a>;
    };

    var tag = function(tag) {
      return <li key={tag}><a href={"?f=." + tag} data-tag={tag}>{tag}</a></li>;
    };

    return (
      <div id="browser">
        <div className="row">
          <div id="filterer" className="col-md-3" ref="filterer">
            <form action={this.props.searchPath} className="filter_mode" style={{position: "relative"}} onSubmit={this.refresh}>
              <span id="filter-clearer" onClick={this.clearFilter}>
                <a href="#"><i className="glyphicon glyphicon-ban-circle"></i></a>
              </span>
              
              <span id="filter-saver">
                <span className="glyphicon glyphicon-pushpin"></span>
              </span>
              
              <div>
                <input type="search" className="form-control" name="f" value={this.state.filter} onChange={this.onInputChange} />
              </div>
              
              <div id="filter-controls" className="btn-group">
                <span id="filter-tags" className="btn btn-default btn-xs" data-toggle="dropdown">
                  Tags <span className="caret"></span>
                </span>
                <ul id="filter-tags-dropdown" className="dropdown-menu" role="menu">
                  {this.state.tags.map(tag)}
                </ul>
              
               {this.state.filters.map(savedFilter)}
              </div>
            </form>
          </div>
        </div>
        <div className="row">
          <div id="results" className="col-md-3">
            <FilterResults results={this.state.results} selectedId={this.state.active}
                           activate={this.props.activate}
                           destroy={this.destroy} />
          </div>
        </div>
      </div>
    );
  }
});

(function() {
  var tagColors = ["#a00", "#050", "#00f"];

  var tagColorI = 1;
  var getColor = function() {
    return tagColors[tagColorI++ % tagColors.length];
  };

  var FilterResult = React.createClass({
    click: function(e) {
      if (!$(e.target).is(".destroyer") && !e.metaKey) {
        e.preventDefault();
        this.props.activate(this.props.url);
      };
    },

    destroy: function(e) {
      e.preventDefault();
      this.props.destroy(this, $(e.target.closest('li'))[0]);
    },

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
        <li className={this.props.selected ? "selected" : ""} onClick={this.click}>
          <span className="preview">
            <a href={this.props.url}>{this.props.preview}</a>
          </span>
          <span className="actions btn-group">
            <a href={this.props.url} className="btn btn-default btn-xs destroyer" onClick={this.destroy}>
              destroy
            </a>
          </span>
  
          {this.props.tags.map(colorize)}
        </li>
      );
    }
  });
  
  var FilterResults = React.createClass({
    render: function() {
      var self = this, selectedId = this.props.selectedId;
      var results = this.props.results.map(function(result) {
        return <FilterResult key={result.id}
                             itemId={"notes/"+result.id}
                             url={result.url}
                             selected={"notes/"+result.id == selectedId}
                             preview={result.preview}
                             tags={result.tags}
                             activate={self.props.activate}
                             destroy={self.props.destroy} />;
      });

      if (results.length)
        results.push(<li key="-1" style={{textAlign: "center"}}>No more results</li>);
      else
        results.push(<li key="-1" style={{textAlign: "center"}}>No results</li>);

      return <ul>{results}</ul>;
    }
  });

  window.FilterResult = FilterResult;
  window.FilterResults = FilterResults;
})();
