
function Note() {
}
var get_editted_note = function() {
    var note = new Note();
    var form = $('.note_footer');
    note.title = form.find('*[name=note\\[title\\]]').val();
    note.body = form.find('textarea').val();
    note.tag_list = form.find('*[name=note\\[tag_list\\]]').val();
    return note;
};
var query_param = function(key) {
    var pairs = location.search.replace(/^\?/, '').split('&');
    for (var i=0; i < pairs.length; ++i)
	if (pairs[i].substr(0, key.length) == key)
	    return pairs[i].substr(key.length+1);
};

$(document).ready(function() {
    var order = query_param('order');
    var collapse = query_param('collapse');
    var filter_string = query_param('filter');
    setFilter = function(filter) {
	var spinner = $('#filter .input_label img');
	var label = $('#filter .input_label span');
	var input = $('#filter input');
	var qparams = [];
	var hist_href = location.pathname;
	var load_href = location.pathname + '?_=';
	if (filter) {
	    var escaped = filter
		.replace('&', '%26')
		.replace('?', '%3F')
		.replace('#', '%23')
		.replace(';', '%3B');
	    qparams.push('filter='+escaped);
	    load_href += '&filter='+encodeURIComponent(filter);
	}
	if (collapse) {
	    qparams.push('collapse=true');
	    load_href += '&collapse=true';
	}
	if (order == 'version_date') {
	    qparams.push('order=version_date');
	    load_href += '&order=version_date';
	}
	hist_href += '?' + qparams.join('&');
	
	input.val(filter);
	label.css('visibility', 'hidden');
	spinner.css('visibility', 'visible');
	$('.content').load(load_href, function() {
	    spinner.css('visibility', 'hidden');
	    label.css('visibility', 'visible');
	    history.pushState(filter, '', hist_href);
	    filter_string = filter;
	    $('body').scrollTop(0);
	});
    };
    window.onpopstate = function(e) {
	var query_filter = location.search || "?filter=";
	query_filter = (query_filter.match(/filter=([^&]*)/) || ['',''])[1];
	query_filter = decodeURIComponent(query_filter)
	if (e.state) {
	    setFilter(e.state);
	} else {
	    setFilter(query_filter);
	}
    };

    $('.note .body table').tablesorter();
    $('.note .body table').addClass('table table-striped');
    $.ajaxSetup({
	complete: function() {
	    $('.note .body table').tablesorter();
	    $('.note .body table').addClass('table table-striped');
	}
    });

    $('body').on('click', 'a .tag, a.tag, button.tag', function(e) {
	if (!e.ctrlKey) {
	    var tag = $(this).data('tag') || $(this).text();
	    e.preventDefault();
	    setFilter('.'+tag);
	}
    });
    $('form#filter').submit(function(e) {
	e.preventDefault();
	setFilter($(this).find('input').val());
    });

    original_note = get_editted_note();
    original_note.new_record = true;
    $('body').on('click', 'a.note-editor', function(e) {
	e.preventDefault();
	$('.note_footer').load($(this).attr('href'), function() {
	    original_note = get_editted_note();
	    original_note.new_record = false;
	    $(this).find('textarea').focus();
	});
    });
    $('body').on('submit', 'form.new_note', function(e) {
	var date = '';
	var now = new Date();
	date += 1900 + now.getYear() + '/';
	date += 1 + now.getMonth() + '/';
	date += now.getDate() + '/';
	date += now.getHours() + '/';
	date += now.getMinutes() + '/';
	date += now.getSeconds();
	$(this).find('input[name=note\\[date\\]]').val(date);
    });

    $('body').on('focus', '.note_footer textarea', function() {
	$(this).parents('.note_footer').removeClass('collapsed');
    });
    $('body').click(function(e) {
	if ($(e.target).is('a'))
	    return;
	if ($(e.target).is('a *'))
	    return;
	if ($(e.target).is('input'))
	    return;
	if ($(e.target).parents('.note_footer').length)
	    return;
	$('.note_footer').addClass('collapsed');
    });

    var last_timestamp = 0;
    $('body').keyup(function(e) {
	if (e.which != 27)
	    return;

	var timestamp = new Date().getTime();
	if (timestamp - last_timestamp < 400) {
	    if ($('.note_footer').hasClass('collapsed')) {
		$('.note_footer').removeClass('collapsed');
		$('.note_footer').find('textarea').focus();
	    } else {
		$('.note_footer').addClass('collapsed');
	    }
	} else {
	    last_timestamp = new Date().getTime();
	}
    });
    var exitWarning = function(e) {
	var orig = original_note;
	var edit = get_editted_note();
	if (edit.title != orig.title
	    || edit.body != orig.body
	    || edit.tag_list != orig.tag_list)
	    return 'There are unsaved changes.';
    };
    window.addEventListener('beforeunload', exitWarning);
    $('body').on('submit', 'form.new_note', function(e) {
	window.removeEventListener('beforeunload', exitWarning);
    });


    $('body').on('click', '.note header', function(e) {
	if ($(e.target).is('.actions *'))
	    return;
	$(this).parents('.note').toggleClass('collapsed');
    });
    $('body').on('click', 'header.date', function(e) {
	$(this).toggleClass('collapsed');
    });

    $('#collapse_results').change(function() {
	collapse = $(this).is(':checked');
	if (collapse)
	    $('.note').addClass('collapsed');
	else
	    $('.note').removeClass('collapsed');
    });
    $('#order_by_version').change(function() {
	order = $(this).is(':checked') ? 'version_date' : false;
	setFilter(filter_string);
    });
});
