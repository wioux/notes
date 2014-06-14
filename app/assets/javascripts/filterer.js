function setFilter(filter, skipPushState, callback) {
    $('#filterer input').val(filter);

    var qparams = [];
    var hist_href = location.pathname;
    if (filter) {
	var escaped = filter
	    .replace('&', '%26')
	    .replace('?', '%3F')
	    .replace('#', '%23')
	    .replace(';', '%3B');
	qparams.push('f='+escaped);
    }
    hist_href += '?' + qparams.join('&');
    
    if (!skipPushState) {
	history.pushState({filter: filter}, '', hist_href);
    }
    
    $.ajax({
	method: 'get',
	url: '/notes/filter',
	data: { filter: filter },
	success: function(notes) {
	    loadBrowser(notes, callback);
	}
    });
}

$(document).ready(function() {
    $('#filterer form').submit(function(e) {
	e.preventDefault();
	setFilter($(this).find('input').val());
    });

    $('#filterer #filter-focuser').click(function() {
	$(this).parents('form').find('input').focus();
    });
    $('#filterer #filter-clearer').click(function() {
	setFilter('');
    });
    
    $('#filterer form').each(function() {
	setFilter($(this).find('input').val(), false, function(notes, list) {
	    list.children('li').first().click();
	});
	window.onpopstate = function(e) {
	    if (e.state)
		setFilter(e.state.filter, true);
	    else
		setFilter(query_param('f'));
	};
    });
});
