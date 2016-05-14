
Pinboard = {
  notes: [],
  strings: []
};

Pinboard.notes = [[1, 'center'], [2, 'a'], [3, 'b'], [4, 'c']];
Pinboard.strings = [[1, 2], [1, 3], [1, 4]];

$(document).ready(function() {
  Pinboard.notes.forEach(function(note) {
    var id = note[0], text = note[1];
    $('#pinboard').append(
      $('<div class="note" id="pinboard-item:'+id+'">').text(text)
    );
  });
});
