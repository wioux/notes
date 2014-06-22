var currently_activated_id;
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
}

function browserActivate(item_id) {
    var browser = $('#browser');
    if (!$('form.hasUnsavedChanges')[0] || confirm("Discard changes?")) {
	browser.find('li.selected').removeClass('selected');
	browser.find('li.selector[data-item-id='+item_id+']').addClass('selected');
    
	currently_activated_id = item_id;
	itemActivated(item_id);
    }
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
    var actions = $('<span class="actions">');

    var toggle_pin = $('<button type="button"/>').
	addClass('btn btn-mini pin-toggler');
    actions.append(toggle_pin);

    if (item.id == currently_activated_id)
	li.addClass('selected');

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
});
