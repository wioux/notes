
Viewer = {
    unsavedItems: function() {
        var items = [];
        $('#viewer *[data-pinned=true] form.hasUnsavedChanges').each(function() {
            var id = $(this).parents('*[data-pinned=true]').attr('data-id');
            items.push(parseInt(id));
        });
        return items;
    },

    visibleItem: function() {
        var id = Viewer.visibleBox().attr('data-id');
        return id ? parseInt(id) : id;
    },

    visibleBox: function() {
        return $('#viewer > *:visible');
    },

    boxFor: function(id) {
        return $('#viewer > *[data-id='+id+']');
    },

    unpinnedBoxes: function() {
        return $('#viewer > *[data-pinned=false]');
    },

    pinnedBoxes: function() {
        return $('#viewer > *[data-pinned=true]');
    },

    hideAll: function() {
        $('#viewer > *').hide();
    },

    loadBox: function(item_id, pinned, callback) {
        var unpinned_and_unsaved = Viewer.visibleBox().filter('[data-pinned=false]').
            find('form.hasUnsavedChanges')[0];
        if (unpinned_and_unsaved && !confirm("Discard changes?"))
            return;

        var box = this.boxFor(item_id).filter('[data-pinned=true]');
        if (pinned && box[0]) {
            this.hideAll();
            box.show();
            this.cleanUp();
        } else {
            $.get('/notes/'+item_id, function(response) {
                box = Viewer.addBox(response);
                renderNote()

                Viewer.hideAll();
                box.show();

//              this will remove the new note form
//              Viewer.cleanUp();

                callback && callback();
            });
        }
    },

    addBox: function(contents) {
        $('#viewer').append(contents);
        return $('#viewer').children().last();
    },

    cleanUp: function() {
        Viewer.unpinnedBoxes().not(':visible').remove();
    }
};

$(document).ready(function() {
    $(window).bind('beforeunload', function() {
        var unsaved = Viewer.visibleBox().add(Viewer.pinnedBoxes()).
            find('form.hasUnsavedChanges');
        if (unsaved[0])
            return 'There are unsaved changes';
    });
});
