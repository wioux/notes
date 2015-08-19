
Browser = {
  TAG_COLORS: ['#a00', '#050', '#00f'],
  current_filter_string: null,

  load: function(notes, callback) {
    var li, list;

    list = $('#browser ul');
    list.empty();
    for (var i=0; i < notes.notes.length; ++i) {
      li = Browser.constructItem(notes.notes[i]);
      list.append(li);
    }

    if (notes.notes.length == 0)
      list.append('<li style="text-align: center">No results</li>');
    else
      list.append('<li style="text-align: center">No more results</li>');

    list.append('<li style="border: 0">&nbsp;</li>');
    list.append('<li style="border: 0">&nbsp;</li>');
    list.append('<li style="border: 0">&nbsp;</li>');

    callback && callback(notes);
  },

  update: function(notes) {
    var ind = 0;
    var list = $('#browser ul');
    var first_result_id = list.find('li.selector').first().data('item-id');

    for (var i=0; i < notes.notes.length; ++i)
      if (notes.notes[i].id == first_result_id)
        break;
    ind = i;

    for (var li, i=0; i < ind; ++i) {
      li = Browser.constructItem(notes.notes[i]);
      list.prepend(li);
    }

    for (i=ind; i < notes.notes.length; ++i) {
      $('#browser ul li[data-item-id='+notes.notes[i].id+']').
        find('.preview').html(notes.notes[i].preview);
    }
  },

  activate: function(item_id) {
    replaceQueryParam('item_id', item_id);
    itemActivated(item_id);
  },

  insert: function(list, item) {
    var found = false
    list.children('li').each(function() {
      if (item.data('sort') > $(this).data('sort')) {
        found = true;
        item.insertBefore(this);
        return false;
      }
    });
    if (!found)
      item.appendTo(list);
  },

  constructItem: function(item) {
    var colors = Browser.TAG_COLORS;
    var li = $('<li class="selector" '+
               'data-item-id="'+item.id+'" '+
               'data-sort="'+item.original_date+'" >');

    var actions = $('<span class="actions btn-group">');
    var destroy = $('<button type="button"/>').
        addClass('btn btn-default btn-xs destroyer').text('destroy');
    actions.append(destroy);

    li.append($('<span class="preview">').html(item.preview));
    li.append(actions);

    for (var j=0; j < item.tags.length; ++j) {
      li.append('<span class="tag" style="color:'+colors[0]+'">'+
                item.tags[j].short_label+
                '</span>'+(j==item.tags.length-1 ? '' : ', '));
      colors.push(colors.shift());
    }

    return li;
  },

  activateFirstItem: function() {
    $('#browser').find('li').first().click();
  },

  setEdittingState: function(item_id, state) {
    var item = $('#browser ul li[data-item-id='+item_id+']');
    state ? item.addClass('editting') : item.removeClass('editting');
  },

  updateItemStates: function() {
    var selected = Viewer.visibleItem();
    $('#browser ul li.selected').not('[data-item-id='+selected+']').
      removeClass('selected');
    $('#browser ul li[data-item-id='+selected+']:not(.selected)').
      addClass('selected');
  },

  filter: function(filter, callback) {
    $('#filterer input').val(filter);

    $.ajax({
      method: 'get',
      url: '/notes/filter',
      data: { filter: filter },
      success: function(notes) {
        replaceQueryParam('f', filter);
        Browser.current_filter_string = filter;

        Browser.setTags(notes.tags);
        Browser.load(notes, callback);
      }
    });
  },

  refresh: function() {
    $.ajax({
      method: 'get',
      url: '/notes/filter',
      data: { filter: Browser.current_filter_string },
      success: function(notes) {
        Browser.setTags(notes.tags);
        Browser.update(notes);
      }
    });
  },

  setTags: function(tags) {
    var list = $('#filterer ul#filter-tags-dropdown');
    list.empty();

    for (var li, i=0; i < tags.length; ++i) {
        li = $('<li><a href="#"></a></li>');
        li.find('a').text(tags[i]);
        list.append(li);
    }
  }
};

$(document).ready(function() {
  $('#browser').on('click', 'li.selector', function() {
    Browser.activate($(this).data('item-id'));
  });

  $('#browser').on('click', 'ul .selector .destroyer', function(e) {
    e.stopPropagation();
    var selector = $(this).parents('.selector');
    var preview = selector.find('.preview').text();

    if (!confirm("Confirm to destroy:\n\n"+preview))
      return;

    $.ajax({
      method: 'post',
      data: { '_method': 'delete' },
      url: '/notes/'+selector.data('item-id'),
      success: function() {
        return selector.css('position', 'relative').
          animate({left: -selector.width()}, 'slow',
                  $.proxy(selector, 'remove'));
      }
    });
  });

  setInterval(Browser.updateItemStates, 100);

  Browser.current_filter_string = $('#filterer input[type=search]').val();

  $('#filterer form').submit(function(e) {
    e.preventDefault();
    Browser.filter($(this).find('input').val());
  });

  $('#filterer #filter-focuser').click(function() {
    $(this).parents('form').find('input').focus();
  });

  $('#filterer #filter-clearer').click(function() {
    Browser.filter('');
    replaceQueryParam('item_id', '');
  });

  $('#filterer ul#filter-tags-dropdown').on('click', 'a', function(e) {
    e.preventDefault();
    Browser.filter('.'+$(this).text());
  });

  $('#filterer input[type=search]').autocomplete({
    source: location.pathname.replace(/\/$/, '') + '/autocomplete',
    appendTo: $('#filterer'),
    delay: 0
  });
});
