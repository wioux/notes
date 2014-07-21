var current_filter_string;

function setFilter(filter, callback) {
    $('#filterer input').val(filter);

    $.ajax({
        method: 'get',
        url: '/notes/filter',
        data: { filter: filter },
        success: function(notes) {
            current_filter_string = filter;
            loadBrowser(notes, callback);
        }
    });
}

function refreshFilter() {
    $.ajax({
        method: 'get',
        url: '/notes/filter',
        data: { filter: current_filter_string },
        success: function(notes) {
            updateBrowser(notes);
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
        setFilter($(this).find('input').val(), function(notes) {
            Browser.activateFirstItem();
        });
    });
});
