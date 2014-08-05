
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

$(document).ready(function() {
    $('body').on('click', '.tag-selector .btn', function() {
        var form = $('.note-edit form:visible');
        var input = form.find('input[name=note\\[tag_list\\]]')[0];
        if (!input) return console.log('no visible form to edit tags on!');

        if ($(this).is('.active')) {
            var tags = input.value.split(/\s*,\s*/);
            for (var i=0; i < tags.length; i++)
                if (tags[i] == $(this).text())
                    tags.splice(i, 1);
            input.value = tags.join(', ');
        } else {
            var text = input.value.match(/\S/) ?
                ', '+$(this).text() :
                $(this).text();
            input.value = input.value.replace(/,?\s*$/, '') + text;
        }
        $(input).trigger('input');
    });
});
