
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

    var formData = new FormData(form[0]);
    form.each(function() {
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: callback
        });
    });
}

function renderNote() {
    renderAbc();
    $('.note .body table').tablesorter();
    $('.note .body table').addClass('table table-striped');

    var makeDirty = function() {
        var id = $(this).parents('.note').attr('data-id');
        $(this).parents('form').addClass('hasUnsavedChanges');
    };

    $('.note-edit form').on('input', ':input', makeDirty);
    $('.note-edit form').on('change', 'input[type=file]', makeDirty);
}

function renderAbc() {
    $('div.abc:not(.rendered)').each(function() {
        var abc = $(this).text();
        ABCJS.renderAbc(this, abc, {}, {staffwidth: 800, paddingbottom: -30});
        $(this).addClass('rendered');

        var midi_link = $(this).append('<div class="midi" />').find('.midi')[0];
        ABCJS.renderMidi(midi_link, abc);

        var midi = $(midi_link).find('a').attr('href');
        var midi_data = midi.replace(/^data:audio\/midi,/, '');

        var hex, midi_binary = '';
        while (midi_data.length) {
            if (midi_data[0] == '%') {
                hex = parseInt(midi_data.substr(1, 2), 16);
                midi_binary += String.fromCharCode(hex);
                midi_data = midi_data.substr(3);
            }  else {
                midi_binary += midi_data[0];
                midi_data = midi_data.substr(1);
            }
        }
        midi_data = 'data:audio/midi;base64,'+btoa(midi_binary);

        var player = $('<a href="#"/>').text('play midi');
        player.click(function(e) {
            e.preventDefault();
            MIDI.Player.loadFile(midi_data);
            MIDI.Player.start();
        });
        $(midi_link).prepend(player, '<br />');
    });
}
