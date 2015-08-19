
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

    editMode: function() {
      var note = Viewer.visibleBox();
      if (note.find('.note-edit:visible')[0]) {
        if (note.find('form.hasUnsavedChanges')[0])
          if (!confirm("Discard changes?"))
            return;
        note.remove();
        Browser.activate(note.attr('data-id'));
      } else {
        note.find('.note-display').hide();
        note.find('.note-edit').show().
          find('textarea[name=note\\[body\\]]').focus();
      }
    },

    save: function() {
      Viewer.visibleBox().find('form:visible').each(function() {
        var form = $(this);
        submitNote(form, function(response) {
          form.removeClass('hasUnsavedChanges');
          Browser.activate(response.id);
          Browser.refresh();
        });
      });
    },

    inspect: function() {
      Viewer.visibleBox().find('form').each(function() {
        var form = $(this);
        $.ajax({
          url: '/notes/preview',
          method: 'post',
          data: form.serialize(),
          success: function(resp) {
            $('#inspector .modal-body').html(resp);
            $('#inspector').modal();
            renderNote();
          }
        });
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
