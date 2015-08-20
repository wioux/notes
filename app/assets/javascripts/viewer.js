
Viewer = {
  contents: function(selector) {
    return $('#viewport #content > * ' + (selector || ''));
  },

  itemId: function() {
    var id = Viewer.contents().attr('data-id');
    return id ? parseInt(id) : id;
  },

  load: function(url) {
    var unsaved = Viewer.contents('form.hasUnsavedChanges')[0];
    if (unsaved && !confirm("Discard changes?"))
      return;

    $.ajax({
      url: url,
      method: 'get',
      success: function(response) {
        Turbolinks.replace(response, { change: 'viewport' });
        window.history.pushState({ turbolinks: true, url: url }, '', url);
        $('#viewport *[autofocus]').focus();
      }
    });
  },

  editMode: function() {
    var note = Viewer.contents();
    if (note.find('.note-edit')[0])
      Viewer.load(note.attr('data-url'));
    else
      Viewer.load(note.attr('data-edit-url'));
  },

  save: function() {
    var note = Viewer.contents();
    var form = note.find('form:visible');
    Note.submit(form, function(response) {
      Turbolinks.visit(note.attr('data-url'));
    });
  },

  inspect: function() {
    Viewer.contents('form').each(function() {
      var form = $(this);
      $.ajax({
        url: '/notes/preview',
        method: 'post',
        data: form.serialize(),
        success: function(resp) {
          $('#inspector .modal-body').html(resp);
          $('#inspector').modal();
          Note.render();
        }
      });
    });
  }
};

$(document).ready(function() {
  $(window).bind('beforeunload', function() {
    var unsaved = Viewer.contents('form.hasUnsavedChanges');
    if (unsaved[0])
      return 'There are unsaved changes';
  });

  $(document).on('page:before-change', function(e) {
    var unsaved = Viewer.contents('form.hasUnsavedChanges');
    if (unsaved[0] && !confirm('There are unsaved changes. Really navigate away?'))
      e.preventDefault();
  });

  $(document).on('click', '#viewport .tags a', function(e) {
    if (!e.metaKey) {
      e.preventDefault();
      Browser.load($(this).attr('href'));
    }
  });
});
