
Browser = {
  focus: function() {
    $('#filterer input').focus().select();
  }
};

$(document).ready(function() {
  Browser.ref = ReactDOM.render(React.createElement(Sidebar), $('#sidebar')[0]);

  Browser.ref.setState({
    searchPath: "/notes.json",
    autoCompletePath: "/autocomplete",
    active: Viewer.itemId(),
    tags: $("#filter-tags-dropdown li a").toArray().map(function(e) {
      return e.textContent
    })
  });

  window.onpopstate = Browser.ref.popHistory;
  Browser.ref.popHistory();
});
