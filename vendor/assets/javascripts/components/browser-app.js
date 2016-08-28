(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.BrowserApp = require("./src/browser-app.js.jsx").BrowserApp;

},{"./src/browser-app.js.jsx":2}],2:[function(require,module,exports){

exports.BrowserApp = React.createClass({
  displayName: "BrowserApp",

  propTypes: {
    searchPath: React.PropTypes.string.isRequired,
    searchPlaceholder: React.PropTypes.string,

    resultTag: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),

    initialFilter: React.PropTypes.string,
    initialResults: React.PropTypes.array,
    initialSelectedResult: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),

    // Called after filter search/refresh
    onFilter: React.PropTypes.func,

    // Called after a filter result is selected
    onSelect: React.PropTypes.func,

    // Called after content is loaded into the viewport
    onLoad: React.PropTypes.func,

    // Called before content is unloaded from the viewport
    onUnload: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onFilter: function () {},
      onSelect: function () {},
      onLoad: function () {}
    };
  },

  getInitialState: function () {
    return {
      filter: this.props.initialFilter || "",

      // filter results
      results: this.props.initialResults || [],

      // .id of selected filter result
      selectedResult: this.props.initialSelectedResult || null,

      // url of the content displayed in the viewport
      viewPortUrl: null,

      // content displayed in the viewport
      viewportHTML: this.props.__html || this.props.children || ""
    };
  },

  componentDidMount: function () {
    this.refs.ui.parentNode.style.height = "100%";
  },

  filter: function (f, callback) {
    var self = this;

    $.ajax({
      dataType: "json",
      data: { f: f },
      url: this.props.searchPath,

      success: function (resp) {
        self.setState({ filter: f, results: resp.results }, function () {
          self.props.onFilter(resp);
          callback && callback(resp);
        });
      },

      error: function () {
        console.log("error!");
        console.log(arguments);
      }
    });
  },

  refreshFilter: function (e) {
    e && e.preventDefault();
    this.filter(this.state.filter);
  },

  clearFilter: function (e) {
    e && e.preventDefault();

    var self = this;
    this.filter("", function () {
      self.refs.filter.focus();
      self.refs.filter.select();
    });
  },

  setViewport: function (url, id, signal, callback) {
    var self = this;
    $.get(url, function (html) {
      self.setState({
        selectedResult: id,
        viewportUrl: url,
        viewportHTML: html
      });

      if (signal !== false) self.props["onLoad"](url.split("?", 2)[0]);

      callback && callback();
    });
  },

  onFilterInputChange: function (e) {
    this.setState({ filter: e.target.value });
  },

  onSelectResult: function (id, url, e) {
    if (url && !$(e.target).is("a,button,input,textarea")) {
      e.preventDefault();
      this.setViewport(url, id, true, this.props.onSelect);
    } else if (url && e.target.nodeName == "A" && e.target.attributes.href.value == url) {
      e.preventDefault();
      this.setViewport(url, id, true, this.props.onSelect);
    }
  },

  render: function () {
    var self = this;

    var resultTag = this.props.resultTag;
    if (typeof resultTag == "string") resultTag = window[resultTag];

    var results = this.state.results.map(function (result) {
      if (resultTag) {
        var e = React.createElement(resultTag, result);
        return React.createElement(
          "li",
          { key: result.id,
            className: result.id == self.state.selectedResult ? "browser-app-selected" : "",
            onClick: self.onSelectResult.bind(self, result.id, result.url) },
          e
        );
      } else if (result.html) {
        return React.createElement("li", { key: result.id,
          className: result.id == self.state.selectedResult ? "browser-app-selected" : "",
          onClick: self.onSelectResult.bind(self, result.id, result.url),
          dangerouslySetInnerHTML: { __html: result.html } });
      }
    });

    if (results.length) results.push(React.createElement(
      "li",
      { key: "-1", style: { textAlign: "center" } },
      "No more results"
    ));else results.push(React.createElement(
      "li",
      { key: "-1", style: { textAlign: "center" } },
      "No results"
    ));

    var content = typeof this.state.viewportHTML == "string" ? React.createElement("div", { className: "browser-app-viewport-content",
      dangerouslySetInnerHTML: { __html: this.state.viewportHTML } }) : React.createElement(
      "div",
      { className: "browser-app-viewport-content" },
      this.state.viewportHTML
    );

    return React.createElement(
      "div",
      { ref: "ui", className: "browser-app" },
      React.createElement(
        "div",
        { className: "browser-app-filter" },
        React.createElement(
          "form",
          { action: this.props.searchPath, onSubmit: this.refreshFilter },
          React.createElement(
            "div",
            { className: "browser-app-filter-container" },
            React.createElement(
              "span",
              { className: "browser-app-filter-clear", onClick: this.clearFilter },
              React.createElement(
                "a",
                { href: "#" },
                React.createElement("i", { className: "fa fa-ban" })
              )
            ),
            React.createElement("input", { ref: "filter", type: "search", name: "f", autoComplete: "off",
              placeholder: this.props.searchPlaceholder, value: this.state.filter, onChange: this.onFilterInputChange })
          )
        ),
        React.createElement(
          "ul",
          { className: "browser-app-results" },
          results
        )
      ),
      React.createElement(
        "div",
        { className: "browser-app-viewport" },
        content
      )
    );
  }
});

},{}]},{},[1]);
