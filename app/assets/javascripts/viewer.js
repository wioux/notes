$(document).ready(function() {
    $(window).on('keydown.saveNote', function(e) {
	if (!event.ctrlKey && !event.metaKey)
	    return
	if (String.fromCharCode(event.which).toLowerCase() != 's')
	    return;
	
	$('#viewer .note-editor form').each(function() {
	    var form = $(this);
	    e.preventDefault();
	    submitNote(form, function(view) {
		form.parents('.note-editor').hide();
		form.parents('.note-editor').siblings('.note').show();
		form.parents('.note-editor').siblings('.note').html(view).show();
	    });
	});
    });

    $('#viewer').on('dblclick.editNote', '.note', function(e) {
	e.preventDefault();
	$(this).hide();
	$('#viewer .note-editor').show();
    });
});
