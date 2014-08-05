var current_filter_string;

function setFilter(filter, callback) {
    var mix_pinned = $('#filterer #filter-mix-pinned').is('.active');
    $('#filterer input').val(filter);

    $.ajax({
        method: 'get',
        url: '/notes/filter',
        data: { filter: filter, mix_pinned: mix_pinned },
        success: function(notes) {
            replaceQueryParam('f', filter);
            current_filter_string = filter;

            loadTags(notes.tags);
            loadBrowser(notes, callback);
        }
    });
}

function refreshFilter() {
    var mix_pinned = $('#filterer #filter-mix-pinned').is('.active');

    $.ajax({
        method: 'get',
        url: '/notes/filter',
        data: { filter: current_filter_string, mix_pinned: mix_pinned },
        success: function(notes) {
            loadTags(notes.tags);
            updateBrowser(notes);
        }
    });
}

function loadTags(tags) {
    var list = $('#filterer ul#filter-tags-dropdown');
    list.empty();

    for (var li, i=0; i < tags.length; ++i) {
        li = $('<li><a href="#"></a></li>');
        li.find('a').text(tags[i]);
        list.append(li);
    }
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
        replaceQueryParam('item_id', '');
    });

    $('#filterer ul#filter-tags-dropdown').on('click', 'a', function(e) {
        e.preventDefault();
        setFilter('.'+$(this).text());
    });

    $('#filterer #filter-mix-pinned').on('click', function(e) {
        if ($(this).is('.active')) {
            Viewer.considerAllItemsUnpinned = false;
            replaceQueryParam('mix_pinned', '');
        } else {
            Viewer.considerAllItemsUnpinned = true;
            replaceQueryParam('mix_pinned', true);
        }
        setTimeout(function() {
            setFilter(current_filter_string);
        }, 10);
    });

    if (getQueryParam('mix_pinned') == 'true')
        $('#filterer #filter-mix-pinned').trigger('click');

    $('#filterer input[type=search]').autocomplete({
        source: location.pathname.replace(/\/$/, '') + '/autocomplete',
        appendTo: $('#filterer'),
        delay: 0
    });
});
