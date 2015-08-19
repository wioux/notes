$(document).ready(function() {
  $(window).on('keydown.saveNote', function(e) {
    if (!e.ctrlKey && !e.metaKey)
      return

    if (!event.metaKey) {
      switch(String.fromCharCode(e.which).toLowerCase()) {
      case 'n':
        e.preventDefault();
        itemCreated();
        break;
      case 'i':
        e.preventDefault();
        itemInspected();
        break;
      }
      return;
    }

    switch(String.fromCharCode(e.which).toLowerCase()) {
    case 'e':
      e.preventDefault();
      itemEdited();
      break;
    case 's':
      e.preventDefault();
      itemSaved();
      break;
    }
  });
});
