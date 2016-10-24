// browserify prosemirror.js --outfile vendor/assets/javascripts/prosemirror.js

var {ProseMirror} = require("./node_modules/prosemirror/dist/edit");
var {schema} = require("./node_modules/prosemirror/dist/schema-basic");
var {Block, Schema} = require("./node_modules/prosemirror/dist/model");
var {exampleSetup} = require("./node_modules/prosemirror/dist/example-setup");
var {buildMenuItems} = require("./node_modules/prosemirror/dist/example-setup");
var {blockTypeItem} = require("./node_modules/prosemirror/dist/menu");

class AbcTune extends Block {
  get isCode() { return true }

  get matchDOMTag() {
    return {
      "pre": function(dom) {
        if (dom.getAttribute("class") != "abc")
          return false;
        return [null, { preserveWhitespace: true }];
      }
    };
  }

  toDOM(node) {
    return ["pre", { "class": "abc" }, 0];
  }
};

var tune = {
  type: AbcTune,
  content: "text*",
  group: "block"
};

schema = new Schema({
  nodes: schema.nodeSpec.addBefore("code_block", "abc_tune", tune),
  marks: schema.markSpec
});
var menu = buildMenuItems(schema);

menu.blockMenu[0][0].content.splice(2, 0,
   blockTypeItem(schema.nodes.abc_tune, {
     title: "Change to ABC tune",
     label: "Tune"
   })
);

var plugins = [
  exampleSetup.config({
    menuBar: { float: false, content: menu.fullMenu }
  })
];

window.ProseMirror = ProseMirror;
window.ProseMirrorSchema = schema;
window.ProseMirrorPlugins = plugins;
window.ProseMirrorMenu = menu;
