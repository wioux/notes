$(document).ready(function() {
  $(window).on('keydown', function(e) {
    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'n':
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        Viewer.loadBox('new', Viewer.editMode);
      }
      break;
    case 'i':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        Viewer.inspect();
      }
      break;
    case 'e':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        Viewer.editMode();
      }
      break;
    case 's':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        Viewer.save();
      } else if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        Browser.focus();
      }
      break;
    }
  });
});

