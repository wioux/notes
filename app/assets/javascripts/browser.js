var browser_tag_colors = ['#a00', '#050', '#00f'];

function loadBrowser(notes, callback) {
    var li, list;

    list = $('#browser ul#pinned');
    list.empty();
    for (var i=0; i < notes.pinned.length; ++i) {
        li = constructBrowserItem(notes.pinned[i]);
        list.append(li);
    }

    list = $('#browser ul#unpinned');
    list.empty();
    for (var i=0; i < notes.unpinned.length; ++i) {
        li = constructBrowserItem(notes.unpinned[i]);
        list.append(li);
    }

    if (notes.unpinned.length == 0)
        list.append('<li style="text-align: center">No results</li>');
    else
        list.append('<li style="text-align: center">No more results</li>');

    list.append('<li style="border: 0">&nbsp;</li>');
    list.append('<li style="border: 0">&nbsp;</li>');

    callback && callback(notes);
}

function updateBrowser(notes) {
    var ind = 0;
    var list = $('#browser ul#unpinned');
    var first_result_id = list.find('li.selector').first().data('item-id');

    for (var i=0; i < notes.unpinned.length; ++i)
        if (notes.unpinned[i].id == first_result_id)
            break;
    ind = i;

    for (var li, i=0; i < ind; ++i) {
        li = constructBrowserItem(notes.unpinned[i]);
        list.prepend(li);
    }

    for (var i=0; i < notes.pinned.length; ++i)
        $('#browser ul#pinned li[data-item-id='+notes.pinned[i].id+']').
            find('.preview').html(notes.pinned[i].preview);
    for (i=ind; i < notes.unpinned.length; ++i)
        $('#browser ul#unpinned li[data-item-id='+notes.unpinned[i].id+']').
            find('.preview').html(notes.unpinned[i].preview);
}

function browserActivate(item_id) {
    replaceQueryParam('item_id', item_id);
    itemActivated(item_id, pinned);
}

function browserInsert(list, item) {
    var found = false
    list.children('li').each(function() {
        if (item.data('sort') > $(this).data('sort')) {
            found = true;
            item.insertBefore(this);
            return false;
        }
    });
    if (!found)
        item.appendTo(list);
}

function constructBrowserItem(item) {
    var colors = browser_tag_colors;
    var li = $('<li class="selector" '+
               'data-item-id="'+item.id+'" '+
               'data-sort="'+item.original_date+'" >');
    var actions = $('<span class="actions btn-group">');

    var toggle_pin = $('<button type="button"/>').
        addClass('btn btn-default btn-xs pin-toggler');
    actions.append(toggle_pin);

    var destroy = $('<button type="button"/>').
        addClass('btn btn-default btn-xs destroyer').text('destroy');
    actions.append(destroy);

    li.append($('<span class="preview">').html(item.preview));
    li.append(actions);

    for (var j=0; j < item.tags.length; ++j) {
        li.append('<span class="tag" style="color:'+colors[0]+'">'+
                  item.tags[j].short_label+
                  '</span>'+(j==item.tags.length-1 ? '' : ', '));
        colors.push(colors.shift());
    }

    return li;
}

$(document).ready(function() {
    $('#browser').on('click', 'li.selector', function() {
        browserActivate($(this).data('item-id'));
    });

    $('#browser').on('click', 'ul#pinned .selector .pin-toggler', function(e) {
        var selector = $(this).parents('li.selector');
        e.stopPropagation();
        $.ajax({
            method: 'post',
            url: '/notes/'+selector.data('item-id')+'/unpin',
            data: { '_method': 'patch' },
            success: function() {
                browserInsert($('#browser ul#unpinned'), selector);
            }
        });
    });

    $('#browser').on('click', 'ul#unpinned .selector .pin-toggler', function(e) {
        var selector = $(this).parents('li.selector');
        e.stopPropagation();
        $.ajax({
            method: 'post',
            url: '/notes/'+selector.data('item-id')+'/pin',
            data: { '_method': 'patch' },
            success: function() {
                browserInsert($('#browser ul#pinned'), selector);
            }
        });
    });

    $('#browser').on('click', 'ul .selector .destroyer', function(e) {
        e.stopPropagation();
        var selector = $(this).parents('.selector');
        var preview = selector.find('.preview').text();

        if (!confirm("Confirm to destroy:\n\n"+preview))
            return;

        $.ajax({
            method: 'post',
            data: { '_method': 'delete' },
            url: '/notes/'+selector.data('item-id'),
            success: function() {
                return selector.css('position', 'relative').
                    animate({left: -selector.width()}, 'slow',
                            $.proxy(selector, 'remove'));
            }
        });
    });
});

Browser = {
    activateFirstItem: function() {
        $('#browser').find('li').first().click();
    },

    pinnedItems: function() {
        var items = [];
        $('#browser ul#pinned li').each(function() {
            items.push($(this).data('item-id'));
        });
        return items;
    },

    setEdittingState: function(item_id, state) {
        var item = $('#browser ul#pinned li[data-item-id='+item_id+']');
        state ? item.addClass('editting') : item.removeClass('editting');
    },

    updateItemStates: function() {
        var unsaved = Viewer.unsavedItems();
        var pinned = Browser.pinnedItems();
        var selected = Viewer.visibleItem();

        for (var i=0; i < pinned.length; ++i)
            Browser.setEdittingState(pinned[i], unsaved.indexOf(pinned[i]) != -1);

        $('#browser ul li.selected').not('[data-item-id='+selected+']').
            removeClass('selected');
        $('#browser ul li[data-item-id='+selected+']:not(.selected)').
            addClass('selected');
    }
};

$(document).ready(function() {
    setInterval(Browser.updateItemStates, 100);
});
