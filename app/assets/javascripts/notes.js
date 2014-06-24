
function submitNote(form, callback) {
    var date = '';
    var now = new Date();
    date += 1900 + now.getYear() + '/';
    date += 1 + now.getMonth() + '/';
    date += now.getDate() + '/';
    date += now.getHours() + '/';
    date += now.getMinutes() + '/';
    date += now.getSeconds();
    form.find('input[name=note\\[date\\]]').val(date);
    form.each(function() {
	$.ajax({
	    url: form.attr('action'),
	    method: form.attr('method'),
	    data: form.serialize(),
	    dataType: 'json',
	    success: callback
	});
    });
}

function renderNote() {
    renderAbc();
    $('.note .body table').tablesorter();
    $('.note .body table').addClass('table table-striped');

    $('.note-edit form').on('input.trackUnsavedChanges', ':input', function() {
	var id = $(this).parents('.note').attr('data-id');
	$(this).parents('form').addClass('hasUnsavedChanges');
    });
}

function renderAbc() {
    $('div.abc:not(.rendered)').each(function() {
	var abc = $(this).text();
	ABCJS.renderAbc(this, abc, {}, {staffwidth: 800, paddingbottom: -30});
	$(this).addClass('rendered');

	var midi = $(this).append('<div class="midi" />').find('.midi')[0];
	ABCJS.renderMidi(midi, abc);
    });
}

$(document).ready(function() {
    (function() {
	var orig = document.createElement;
	document.createElement = function() {
	    if (arguments[0] == 'embed') {
		var span = orig.call(this, 'span');
		span.classList.add('hide-me');
		return span;
	    }
	    return orig.apply(this, arguments);
	};
    })();
});
