
Note = {
  submit: function(form, callback) {
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
  },

  render: function() {
    Note.renderAbc();
    $('.note .body table').tablesorter();
    $('.note .body table').addClass('table table-striped');

    $('.note-edit input[name*=tag_list]').autocomplete({
      source: '/tags/autocomplete',
      position: { my: 'left bottom', at: 'left top' },
      delay: 0
    });
  },

  renderAbc: function() {
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
};

$(document).on('page:change', function() {
  Note.render();
});

$(document).ready(function() {
  $(document).on('show.bs.modal', '.tag-selector', function() {
    var tags = $('.note-edit input[name=note\\[tag_list\\]]').val().split(/\s*,\s*/);
    $(this).find('.btn').each(function() {
      if (tags.indexOf($(this).text()) == -1) {
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
      }
    });
  });

  $(document).on('click', '.tag-selector .btn', function() {
    var input = $('.note-edit input[name=note\\[tag_list\\]]')[0];
    if ($(this).is('.active')) {
      var text = input.value.match(/\S/) ? ', '+$(this).text() : $(this).text();
      input.value = input.value.replace(/,?\s*$/, '') + text;
    } else {
      var tags = input.value.split(/\s*,\s*/);
      for (var i=0; i < tags.length; i++)
        if (tags[i] == $(this).text())
          tags.splice(i, 1);
      input.value = tags.join(', ');
    }
    $(input).trigger('input');
  });

  $(document).on('change', '.note-edit form input[type=file]', function() {
    var new_field = $(this).clone();
    var new_id = this.id.replace(/(note_attachments_attributes_)(\d+)/,
                                 function(e, p1, p2) {
                                   return p1+(parseInt(p2)+1);
                                 });
    var new_name = this.name.replace(/(note\[attachments_attributes\]\[)(\d)+/,
                                     function(e, p1, p2) {
                                       return p1+(parseInt(p2)+1);
                                     });
    new_field.attr('id', new_id);
    new_field.attr('name', new_name);
    new_field.val('');
    $(this).parent().append(new_field);
  });


  var makeDirty = function() {
    var id = $(this).parents('.note').attr('data-id');
    $(this).parents('form').addClass('hasUnsavedChanges');
  };

  $(document).on('input', '.note-edit form :input', makeDirty);
  $(document).on('change', '.note-edit form input[type=file]', makeDirty);
});
