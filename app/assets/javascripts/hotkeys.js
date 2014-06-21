$(document).ready(function() {
    $(window).on('keydown.saveNote', function(e) {
	if (!e.ctrlKey && !e.metaKey)
	    return

	if (!event.metaKey) {
	    switch(String.fromCharCode(event.which).toLowerCase()) {
	    case 'n':
		e.preventDefault();
		itemCreated();
		break;
	    }
	    return;
	}
	
	switch(String.fromCharCode(event.which).toLowerCase()) {
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
