var currently_activated_id;
var browser_tag_colors = ['#a00', '#050', '#00f'];

function loadBrowser(notes, callback) {
    var colors, li, list;
    colors = browser_tag_colors.slice(0);
    list = $('#browser ul');
    list.empty();

    for (var i=0; i < notes.length; ++i) {
	li = constructBrowserItem(notes[i]);
	list.append(li);
    }
    
    if (notes.length == 0)
	list.append('<li style="text-align: center">No results</li>');
    else
	list.append('<li style="text-align: center">No more results</li>');

    list.append('<li style="border: 0">&nbsp;</li>');
    list.append('<li style="border: 0">&nbsp;</li>');

    callback && callback(notes, list);
}

function updateBrowser(notes) {
    var ind = 0;
    var list = $('#browser ul');
    var first_result_id = list.find('li.selector').first().data('item-id');

    for (var i=0; i < notes.length; ++i)
	if (notes[i].id == first_result_id)
	    break;
    ind = i;

    for (var li, i=0; i < ind; ++i) {
	li = constructBrowserItem(notes[i]);
	list.prepend(li);
    }
}

function browserActivate(item_id) {
    var browser = $('#browser');
    browser.find('li.selected').removeClass('selected');
    browser.find('li.selector[data-item-id='+item_id+']').addClass('selected');

    currently_activated_id = item_id;
    
    itemActivated(item_id);
}

function constructBrowserItem(item) {
    var colors = browser_tag_colors;
    var li = $('<li data-item-id="'+item.id+'" class="selector">');

    if (item.id == currently_activated_id)
	li.addClass('selected');

    li.append($('<span class="preview">').html(item.preview));

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
});
