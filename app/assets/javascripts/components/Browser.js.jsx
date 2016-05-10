
var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      tags: [],
      savedFilters: [],
      searchPath: "",
      filter: "",
      results: [],
      active: null
    };
  },

  onFilterChange: function(e) {
    this.setState({ filter: e.target.value });
  },

  onActivate: function(item) {
    var self = this;
    Viewer.load(item.props.url, function() {
      self.setState({ active: item.props.itemId });
      self.pushHistory(item.props.url);
    });
  },

  onDestroy: function(item, ui) {
    if (!confirm("Confirm to destroy:\n\n"+item.props.preview))
      return;

    var self = this;
    $.ajax({
      method: "post",
      data: { "_method": "delete" },
      url: item.props.url,
      success: function() {
        $(ui).css('position', 'relative').
          animate({left: -$(ui).width()}, 'slow', function() {
            var newResults = self.state.results
                .filter(function(i) { return i.url != item.props.url });
            self.setState({ results: newResults });
          });
      }
    });
  },

  clearFilter: function() {
    this.setFilter("");
  },

  setFilter: function(f, history) {
    this.setState({ filter: f }, function() { this.getResults(null, history) });
  },

  getResults: function(e, history) {
    var self = this;
    e && e.preventDefault();

    history = arguments[1] === undefined ? true : history;
    history && this.pushHistory();

    $.get(this.state.searchPath+"?f=" + this.state.filter, function(filter) {
      self.setState({ results: filter.results, tags: filter.tags });
    });
  },

  pushHistory: function(url) {
    url = url || location.pathname;
    if (this.state.filter.match(/\S/))
      url += "?f="+encodeURIComponent(this.state.filter);
    window.history.pushState({}, '', url);
  },

  popHistory: function() {
    var f = "";
    (location.search || "?f=").substr(1).split("&").forEach(function(param) {
      var kv = param.split("=", 2);
      if (kv[0] == "f")
        f = decodeURIComponent(kv[1]);
    });

    Browser.ref.setFilter(f, false);
    Viewer.load(location.href, function() {
      Browser.ref.setState({ active: Viewer.itemId() });
    });
  },

  componentDidMount: function() {
    var self = this;
    $("input[type=search]", this.refs.filterer).autocomplete({
      source: '/autocomplete',
      appendTo: this.refs.filterer,
      autoFocus: true,
      delay: 0,

      open: function(e, ui) {
        if (!$(this).parents('.filter_mode')[0])
          $(this).autocomplete('close');
      },

      select: function(e, select) {
        self.setFilter(select.item.value);
      }
    });
  },

  render: function() {
    var savedFilter = function(filter) {
      return <a href={"?"+f.value} className="btn btn-default btn-xs">{filter.name}</a>;
    };

    var tag = function(tag) {
      return <li key={tag}><a href={"?f=." + tag}>{tag}</a></li>;
    };

    return (
      <div id="sidebar">
        <div className="row">
          <div id="filterer" className="col-md-3" ref="filterer">
            <form action={this.state.searchPath} className="filter_mode" style={{position: "relative"}} onSubmit={this.getResults}>
              <span id="filter-clearer" onClick={this.clearFilter}>
                <a href="#"><i className="glyphicon glyphicon-ban-circle"></i></a>
              </span>
              
              <span id="filter-saver">
                <span className="glyphicon glyphicon-pushpin"></span>
              </span>
              
              <div>
                <input type="search" className="form-control" name="f" value={this.state.filter} onChange={this.onFilterChange} />
              </div>
              
              <div id="filter-controls" className="btn-group">
                <span id="filter-tags" className="btn btn-default btn-xs" data-toggle="dropdown">
                  Tags <span className="caret"></span>
                </span>
                <ul id="filter-tags-dropdown" className="dropdown-menu" role="menu">
                  {this.state.tags.map(tag)};
                </ul>
              
               {this.state.savedFilters.map(savedFilter)}
              </div>
            </form>
          </div>
        </div>
        <div className="row">
          <div id="browser" className="col-md-3">
            <FilterResults results={this.state.results} selectedId={this.state.active}
                           onActivate={this.onActivate}
                           onDestroy={this.onDestroy}/>
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
    onClick: function(e) {
      if (!$(e.target).is(".destroyer") && !e.metaKey) {
        e.preventDefault();
        this.props.onActivate(this);
      };
    },

    onDestroy: function(e) {
      e.preventDefault();
      this.props.onDestroy(this, $(e.target.closest('li'))[0]);
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
        <li className={this.props.selected ? "selected" : ""} onClick={this.onClick}>
          <span className="preview">
            <a href={this.props.url}>{this.props.preview}</a>
          </span>
          <span className="actions btn-group">
            <a href={this.props.url} className="btn btn-default btn-xs destroyer" onClick={this.onDestroy}>
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
                             itemId={"note/"+result.id}
                             url={result.url}
                             selected={"note/"+result.id == selectedId}
                             preview={result.preview}
                             tags={result.tags}
                             onActivate={self.props.onActivate}
                             onDestroy={self.props.onDestroy} />;
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
