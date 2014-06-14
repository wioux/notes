var currently_activated_id;

function loadBrowser(notes, callback) {
    var colors, li, list;
    colors = ['#a00', '#050', '#00f'];
    list = $('#browser ul');
    list.empty();

    for (var i=0; i < notes.length; ++i) {
	li = $('<li data-item-id="'+notes[i].id+'" class="selector">');
	if (notes[i].id == currently_activated_id)
	    li.addClass('selected');
	
	li.append($('<span class="preview">').text(notes[i].preview));
	
	for (var j=0; j < notes[i].tags.length; ++j) {
	    li.append('<span class="tag" style="color:'+colors[0]+'">'+
		      notes[i].tags[j].short_label+
		      '</span>'+(j==notes[i].tags.length-1 ? '' : ', '));
	    colors.push(colors.shift());
	}
	
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

$(document).ready(function() {	
    $('#browser').on('click', 'li.selector', function() {
	$('#browser').find('li.selected').removeClass('selected');
	$(this).addClass('selected');

	currently_activated_id = $(this).data('item-id');
	itemActivated(currently_activated_id);
    });
});
