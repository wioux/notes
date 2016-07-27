
var AbcButton = MediumEditor.extensions.button.extend({
  name: "abc",

  contentDefault: "<b>abc</b>",
  aria: "abc notes",

  handleClick: function(e) {
    var el = this.base.getSelectedParentElement();
    if (el.tagName == "PRE")
      el.classList.toggle("abc");
    this.base.checkContentChanged();
  },

  isAlreadyApplied: function(node) {
    return node.tagName == "PRE" && node.classList.contains("abc");
  }
});
