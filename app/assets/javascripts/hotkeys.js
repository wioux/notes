$(document).ready(function() {
  $(window).on('keydown', function(e) {
    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'n':
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        itemCreated()
      }
      break;
    case 'i':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        itemInspected();
      }
      break;
    case 'e':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        itemEdited();
      }
      break;
    case 's':
      if (!e.ctrlKey && !e.altKey && e.metaKey) {
        e.preventDefault();
        itemSaved();
      } else if (e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        Browser.focus();
      }
      break;
    }
  });
});

