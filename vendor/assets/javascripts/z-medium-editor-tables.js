(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.MediumEditorTable = require("medium-editor-tables");


},{"medium-editor-tables":2}],2:[function(require,module,exports){
(function (process){
(function (root, factory) {
  'use strict';
  var isElectron = typeof module === 'object' && process && process.versions && process.versions.electron;
  if (!isElectron && typeof module === 'object') {
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
        return factory;
    });
  } else {
    root.MediumEditorTable = factory;
  }
}(this, function () {

  'use strict';

function extend(dest, source) {
    var prop;
    dest = dest || {};
    for (prop in source) {
        if (source.hasOwnProperty(prop) && !dest.hasOwnProperty(prop)) {
            dest[prop] = source[prop];
        }
    }
    return dest;
}

function getSelectionText(doc) {
    if (doc.getSelection) {
        return doc.getSelection().toString();
    }
    if (doc.selection && doc.selection.type !== 'Control') {
        return doc.selection.createRange().text;
    }
    return '';
}

function getSelectionStart(doc) {
    var node = doc.getSelection().anchorNode,
        startNode = (node && node.nodeType === 3 ? node.parentNode : node);

    return startNode;
}

function placeCaretAtNode(doc, node, before) {
    if (doc.getSelection !== undefined && node) {
        var range = doc.createRange(),
            selection = doc.getSelection();

        if (before) {
            range.setStartBefore(node);
        } else {
            range.setStartAfter(node);
        }

        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function isInsideElementOfTag(node, tag) {
    if (!node) {
        return false;
    }

    var parentNode = node.parentNode,
        tagName = parentNode.tagName.toLowerCase();

    while (tagName !== 'body') {
        if (tagName === tag) {
            return true;
        }
        parentNode = parentNode.parentNode;

        if (parentNode && parentNode.tagName) {
            tagName = parentNode.tagName.toLowerCase();
        } else {
            return false;
        }
    }

    return false;
}

function getParentOf(el, tagTarget) {
    var tagName = el && el.tagName ? el.tagName.toLowerCase() : false;

    if (!tagName) {
        return false;
    }
    while (tagName && tagName !== 'body') {
        if (tagName === tagTarget) {
            return el;
        }
        el = el.parentNode;
        tagName = el && el.tagName ? el.tagName.toLowerCase() : false;
    }
}

function Grid(el, callback, rows, columns) {
    return this.init(el, callback, rows, columns);
}

Grid.prototype = {
    init: function (el, callback, rows, columns) {
        this._root = el;
        this._callback = callback;
        this.rows = rows;
        this.columns = columns;
        return this._render();
    },

    setCurrentCell: function (cell) {
        this._currentCell = cell;
    },

    markCells: function () {
        [].forEach.call(this._cellsElements, function (el) {
            var cell = {
                    column: parseInt(el.dataset.column, 10),
                    row: parseInt(el.dataset.row, 10)
                },
                active = this._currentCell &&
                         cell.row <= this._currentCell.row &&
                         cell.column <= this._currentCell.column;

            if (active === true) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        }.bind(this));
    },

    _generateCells: function () {
        var row = -1;

        this._cells = [];

        for (var i = 0; i < this.rows * this.columns; i++) {
            var column = i % this.columns;

            if (column === 0) {
                row++;
            }

            this._cells.push({
                column: column,
                row: row,
                active: false
            });
        }
    },

    _html: function () {
        var width = this.columns * COLUMN_WIDTH + BORDER_WIDTH * 2,
            height = this.rows * COLUMN_WIDTH + BORDER_WIDTH * 2,
            html = '<div class="medium-editor-table-builder-grid clearfix" style="width:' + width + 'px;height:' + height + 'px;">';
        html += this._cellsHTML();
        html += '</div>';
        return html;
    },

    _cellsHTML: function () {
        var html = '';
        this._generateCells();
        this._cells.map(function (cell) {
            html += '<a href="#" class="medium-editor-table-builder-cell' +
                    (cell.active === true ? ' active' : '') +
                    '" ' + 'data-row="' + cell.row +
                    '" data-column="' + cell.column + '">';
            html += '</a>';
        });
        return html;
    },

    _render: function () {
        this._root.innerHTML = this._html();
        this._cellsElements = this._root.querySelectorAll('a');
        this._bindEvents();
    },

    _bindEvents: function () {
        [].forEach.call(this._cellsElements, function (el) {
            this._onMouseEnter(el);
            this._onClick(el);
        }.bind(this));
    },

    _onMouseEnter: function (el) {
        var self = this,
            timer;

        el.addEventListener('mouseenter', function () {
            clearTimeout(timer);

            var dataset = this.dataset;

            timer = setTimeout(function () {
                self._currentCell = {
                    column: parseInt(dataset.column, 10),
                    row: parseInt(dataset.row, 10)
                };
                self.markCells();
            }, 50);
        });
    },

    _onClick: function (el) {
        var self = this;
        el.addEventListener('click', function (e) {
            e.preventDefault();
            self._callback(this.dataset.row, this.dataset.column);
        });
    }
};

function Builder(options) {
    return this.init(options);
}

Builder.prototype = {
    init: function (options) {
        this.options = options;
        this._doc = options.ownerDocument || document;
        this._root = this._doc.createElement('div');
        this._root.className = 'medium-editor-table-builder';
        this.grid = new Grid(
          this._root,
          this.options.onClick,
          this.options.rows,
          this.options.columns
        );

        this._range = null;
        this._toolbar = this._doc.createElement('div');
        this._toolbar.className = 'medium-editor-table-builder-toolbar';

        var spanRow = this._doc.createElement('span');
        spanRow.innerHTML = 'Row:';
        this._toolbar.appendChild(spanRow);
        var addRowBefore = this._doc.createElement('button');
        addRowBefore.title = 'Add row before';
        addRowBefore.innerHTML = '<i class="fa fa-long-arrow-up"></i>';
        addRowBefore.onclick = this.addRow.bind(this, true);
        this._toolbar.appendChild(addRowBefore);

        var addRowAfter = this._doc.createElement('button');
        addRowAfter.title = 'Add row after';
        addRowAfter.innerHTML = '<i class="fa fa-long-arrow-down"></i>';
        addRowAfter.onclick = this.addRow.bind(this, false);
        this._toolbar.appendChild(addRowAfter);

        var remRow = this._doc.createElement('button');
        remRow.title = 'Remove row';
        remRow.innerHTML = '<i class="fa fa-close"></i>';
        remRow.onclick = this.removeRow.bind(this);
        this._toolbar.appendChild(remRow);

        var spanCol = this._doc.createElement('span');
        spanCol.innerHTML = 'Column:';
        this._toolbar.appendChild(spanCol);
        var addColumnBefore = this._doc.createElement('button');
        addColumnBefore.title = 'Add column before';
        addColumnBefore.innerHTML = '<i class="fa fa-long-arrow-left"></i>';
        addColumnBefore.onclick = this.addColumn.bind(this, true);
        this._toolbar.appendChild(addColumnBefore);

        var addColumnAfter = this._doc.createElement('button');
        addColumnAfter.title = 'Add column after';
        addColumnAfter.innerHTML = '<i class="fa fa-long-arrow-right"></i>';
        addColumnAfter.onclick = this.addColumn.bind(this, false);
        this._toolbar.appendChild(addColumnAfter);

        var remColumn = this._doc.createElement('button');
        remColumn.title = 'Remove column';
        remColumn.innerHTML = '<i class="fa fa-close"></i>';
        remColumn.onclick = this.removeColumn.bind(this);
        this._toolbar.appendChild(remColumn);

        var remTable = this._doc.createElement('button');
        remTable.title = 'Remove table';
        remTable.innerHTML = '<i class="fa fa-trash-o"></i>';
        remTable.onclick = this.removeTable.bind(this);
        this._toolbar.appendChild(remTable);

        var grid = this._root.childNodes[0];
        this._root.insertBefore(this._toolbar, grid);
    },

    getElement: function () {
        return this._root;
    },

    hide: function () {
        this._root.style.display = '';
        this.grid.setCurrentCell({ column: -1, row: -1 });
        this.grid.markCells();
    },

    show: function (left) {
        this._root.style.display = 'block';
        this._root.style.left = left + 'px';
    },

    setEditor: function (range) {
        this._range = range;
        this._toolbar.style.display = 'block';
    },

    setBuilder: function () {
        this._range = null;
        this._toolbar.style.display = 'none';
        var elements = this._doc.getElementsByClassName('medium-editor-table-builder-grid');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.height = (COLUMN_WIDTH * this.rows + BORDER_WIDTH * 2) + 'px';
            elements[i].style.width = (COLUMN_WIDTH * this.columns + BORDER_WIDTH * 2) + 'px';
        }
    },

    addRow: function (before, e) {
        e.preventDefault();
        e.stopPropagation();
        var tbody = this._range.parentNode.parentNode,
            tr = this._doc.createElement('tr'),
            td;
        for (var i = 0; i < this._range.parentNode.childNodes.length; i++) {
            td = this._doc.createElement('td');
            td.appendChild(this._doc.createElement('br'));
            tr.appendChild(td);
        }
        if (before !== true && this._range.parentNode.nextSibling) {
            tbody.insertBefore(tr, this._range.parentNode.nextSibling);
        } else if (before === true) {
            tbody.insertBefore(tr, this._range.parentNode);
        } else {
            tbody.appendChild(tr);
        }
        this.options.onClick(0, 0);
    },

    removeRow: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this._range.parentNode.parentNode.removeChild(this._range.parentNode);
        this.options.onClick(0, 0);
    },

    addColumn: function (before, e) {
        e.preventDefault();
        e.stopPropagation();
        var cell = Array.prototype.indexOf.call(this._range.parentNode.childNodes, this._range),
            tbody = this._range.parentNode.parentNode,
            td;

        for (var i = 0; i < tbody.childNodes.length; i++) {
            td = this._doc.createElement('td');
            td.appendChild(this._doc.createElement('br'));
            if (before === true) {
                tbody.childNodes[i].insertBefore(td, tbody.childNodes[i].childNodes[cell]);
            } else if (this._range.parentNode.parentNode.childNodes[i].childNodes[cell].nextSibling) {
                tbody.childNodes[i].insertBefore(td, tbody.childNodes[i].childNodes[cell].nextSibling);
            } else {
                tbody.childNodes[i].appendChild(td);
            }
        }

        this.options.onClick(0, 0);
    },

    removeColumn: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var cell = Array.prototype.indexOf.call(this._range.parentNode.childNodes, this._range),
            tbody = this._range.parentNode.parentNode,
            rows = tbody.childNodes.length;

        for (var i = 0; i < rows; i++) {
            tbody.childNodes[i].removeChild(tbody.childNodes[i].childNodes[cell]);
        }
        this.options.onClick(0, 0);
    },

    removeTable: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var cell = Array.prototype.indexOf.call(this._range.parentNode.childNodes, this._range),
            table = this._range.parentNode.parentNode.parentNode;

        table.parentNode.removeChild(table);
        this.options.onClick(0, 0);
    }
};

function Table(editor) {
    return this.init(editor);
}

var TAB_KEY_CODE = 9;

Table.prototype = {
    init: function (editor) {
        this._editor = editor;
        this._doc = this._editor.options.ownerDocument;
        this._bindTabBehavior();
    },

    insert: function (rows, cols) {
        var html = this._html(rows, cols);

        this._editor.pasteHTML(
            '<table class="medium-editor-table" id="medium-editor-table"' +
            ' width="100%">' +
            '<tbody>' +
            html +
            '</tbody>' +
            '</table>', {
                cleanAttrs: [],
                cleanTags: []
            }
        );

        var table = this._doc.getElementById('medium-editor-table');
        table.removeAttribute('id');
        placeCaretAtNode(this._doc, table.querySelector('td'), true);

        this._editor.checkSelection();
    },

    _html: function (rows, cols) {
        var html = '',
            x, y,
            text = getSelectionText(this._doc);

        for (x = 0; x <= rows; x++) {
            html += '<tr>';
            for (y = 0; y <= cols; y++) {
                html += '<td>' + (x === 0 && y === 0 ? text : '<br />') + '</td>';
            }
            html += '</tr>';
        }
        return html;
    },

    _bindTabBehavior: function () {
        var self = this;
        [].forEach.call(this._editor.elements, function (el) {
            el.addEventListener('keydown', function (e) {
                self._onKeyDown(e);
            });
        });
    },

    _onKeyDown: function (e) {
        var el = getSelectionStart(this._doc),
            table;

        if (e.which === TAB_KEY_CODE && isInsideElementOfTag(el, 'table')) {
            e.preventDefault();
            e.stopPropagation();
            table = this._getTableElements(el);
            if (e.shiftKey) {
                this._tabBackwards(el.previousSibling, table.row);
            } else {
                if (this._isLastCell(el, table.row, table.root)) {
                    this._insertRow(getParentOf(el, 'tbody'), table.row.cells.length);
                }
                placeCaretAtNode(this._doc, el);
            }
        }
    },

    _getTableElements: function (el) {
        return {
            cell: getParentOf(el, 'td'),
            row: getParentOf(el, 'tr'),
            root: getParentOf(el, 'table')
        };
    },

    _tabBackwards: function (el, row) {
        el = el || this._getPreviousRowLastCell(row);
        placeCaretAtNode(this._doc, el, true);
    },

    _insertRow: function (tbody, cols) {
        var tr = document.createElement('tr'),
            html = '',
            i;

        for (i = 0; i < cols; i += 1) {
            html += '<td><br /></td>';
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    },

    _isLastCell: function (el, row, table) {
        return (
          (row.cells.length - 1) === el.cellIndex &&
          (table.rows.length - 1) === row.rowIndex
        );
    },

    _getPreviousRowLastCell: function (row) {
        row = row.previousSibling;
        if (row) {
            return row.cells[row.cells.length - 1];
        }
    }
};

var COLUMN_WIDTH = 16,
    BORDER_WIDTH = 1,
    MediumEditorTable;

MediumEditorTable = MediumEditor.extensions.form.extend({
    name: 'table',

    aria: 'create table',
    action: 'table',
    contentDefault: 'TBL',
    contentFA: '<i class="fa fa-table"></i>',

    handleClick: function (event) {
        event.preventDefault();
        event.stopPropagation();

        this[this.isActive() === true ? 'hide' : 'show']();
    },

    hide: function () {
        this.setInactive();
        this.builder.hide();
    },

    show: function () {
        this.setActive();

        var range = MediumEditor.selection.getSelectionRange(this.document);
        if (range.startContainer.nodeName.toLowerCase() === 'td' ||
          range.endContainer.nodeName.toLowerCase() === 'td' ||
          MediumEditor.util.getClosestTag(MediumEditor.selection.getSelectedParentElement(range), 'td')) {
            this.builder.setEditor(MediumEditor.selection.getSelectedParentElement(range));
        } else {
            this.builder.setBuilder();
        }
        this.builder.show(this.button.offsetLeft);
    },

    getForm: function () {
        if (!this.builder) {
            this.builder = new Builder({
                onClick: function (rows, columns) {
                    if (rows > 0 || columns > 0) {
                        this.table.insert(rows, columns);
                    }
                    this.hide();
                }.bind(this),
                ownerDocument: this.document,
                rows: this.rows || 10,
                columns: this.columns || 10
            });

            this.table = new Table(this.base);
        }

        return this.builder.getElement();
    }
});

  return MediumEditorTable;
}()));

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
