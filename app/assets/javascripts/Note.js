
Note = {
  submit: function(viewport, callback) {
    var form = $("form", viewport.refs.ui);
    var editor = viewport.editor;

    form.find("textarea").val(editor.getContent("markdown"));

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
            dataType: "json",
            contentType: false,
            processData: false,
            success: function(resp) {
              Note.makeClean();
              callback && callback(resp);
            }
        });
    });
  },

  renderAbc: function() {
    $('div.abc:not(.rendered)').each(function() {
        var abc = $(this).text();
        ABCJS.renderAbc(this, abc, {}, {staffwidth: 800, paddingbottom: 0});
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
  },

  makeDirty: function() {
    $(".note form:not(.hasUnsavedChanges)").first()
      .addClass('hasUnsavedChanges')
      .find('input[type=submit]')
      .removeClass('btn-success')
      .addClass('btn-warning');
  },

  makeClean: function() {
    $(".note form.hasUnsavedChanges").first()
      .removeClass('hasUnsavedChanges')
      .find('input[type=submit]')
      .removeClass('btn-warning')
      .addClass('btn-success');
  }
};

$(document).ready(function() {
  $(document).on('show.bs.modal', '.tag-selector', function() {
    var tags = $('.note input[name=note\\[tag_list\\]]').val().split(/\s*,\s*/);
    $(this).find('.btn').each(function() {
      if (tags.indexOf($(this).text()) == -1) {
        $(this).removeClass('active');
      } else {
        $(this).addClass('active');
      }
    });
  });

  $(document).on('click', '.tag-selector .btn', function() {
    var input = $('.note input[name=note\\[tag_list\\]]')[0];
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

  $(document).on('input', '.note form :input', Note.makeDirty);
  $(document).on('change', '.note form input[type=file]', Note.makeDirty);
});
