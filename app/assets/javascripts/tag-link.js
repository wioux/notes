$(document).ready(function() {
    $('body').on('click', '.tag-links a', function(e) {
        if (!e.ctrlKey && !e.metaKey) {
            var tag = $(this).data('tag') || $(this).text();
            e.preventDefault();
            setFilter('.'+tag);
        }
    });
});
