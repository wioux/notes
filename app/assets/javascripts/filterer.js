function setFilter(filter, callback) {
    $('#filterer input').val(filter);
    
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
	setFilter($(this).find('input').val(), function(notes, list) {
	    list.children('li').first().click();
	});
    });
});
