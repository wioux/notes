
Viewer = {
  // Handlers must implement
  //   - submit(form, callback)
  //   - renderPage()
  handlers: {},

  contents: function(selector) {
    return $('#viewport #content > * ' + (selector || ''));
  },

  itemId: function() {
    return Viewer.contents().attr('data-id');
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
    var content = Viewer.contents();
    if (content.find('.edit')[0])
      Viewer.load(content.attr('data-url'));
    else
      Viewer.load(content.attr('data-edit-url'));
  },

  save: function() {
    var content = Viewer.contents();
    var itemId = Viewer.itemId();
    var type = itemId.split('/')[0];
    var form = content.find('.edit form:visible');
    Viewer.handlers[type].submit(form, function(response) {
      Turbolinks.visit(content.attr('data-url'));
    });
  },

  inspect: function() {
    var itemId = Viewer.itemId();
    var type = itemId.split('/')[0];
    Viewer.contents('.edit form[data-preview-url]').each(function() {
      var form = $(this);
      $.ajax({
        url: form.attr('data-preview-url'),
        method: 'post',
        data: form.serialize(),
        success: function(resp) {
          $('#inspector .modal-body').html(resp);
          $('#inspector').modal();
          Viewer.handlers[type].renderPage();
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
