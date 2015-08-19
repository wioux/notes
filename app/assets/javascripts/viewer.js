
Viewer = {
    visibleItem: function() {
        var id = Viewer.visibleBox().attr('data-id');
        return id ? parseInt(id) : id;
    },

    visibleBox: function() {
        return $('#viewport #content > *:visible');
    },

    boxFor: function(id) {
        return $('#viewport #content > *[data-id='+id+']');
    },

    hideAll: function() {
        $('#viewport #content > *').hide();
    },

    loadBox: function(item_id, callback) {
        var unsaved = Viewer.visibleBox().find('form.hasUnsavedChanges')[0];
        if (unsaved && !confirm("Discard changes?"))
            return;

        $.get('/notes/'+item_id, function(response) {
            box = Viewer.addBox(response);
            renderNote()

            Viewer.hideAll();
            box.show();

//          this will remove the new note form
//          Viewer.unpinnedBoxes().not(':visible').remove();

            callback && callback();
        });
    },

    addBox: function(contents) {
        $('#viewport #content').append(contents);
        return $('#viewport #content').children().last();
    }
};

$(document).ready(function() {
    $(window).bind('beforeunload', function() {
        var unsaved = Viewer.visibleBox().find('form.hasUnsavedChanges');
        if (unsaved[0])
            return 'There are unsaved changes';
    });
});
