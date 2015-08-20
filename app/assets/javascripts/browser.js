
Browser = {
  focus: function() {
    $('#filterer input').focus().select();
  },

  load: function(url) {
    Turbolinks.visit(url, { change: 'sidebar' });
  },

  updateItemStates: function() {
    var selected = Viewer.visibleItem();
    $('#browser ul li.selected').not('[data-item-id='+selected+']').
      removeClass('selected');
    $('#browser ul li[data-item-id='+selected+']:not(.selected)').
      addClass('selected');
  },

  destroy: function(item_id, url) {
    var selector = $('#browser ul .selector[data-item-id='+item_id+']');
    $.ajax({
      method: 'post',
      data: { '_method': 'delete' },
      url: url,
      success: function() {
        return selector.css('position', 'relative').
          animate({left: -selector.width()}, 'slow',
                  $.proxy(selector, 'remove'));
      }
    });
  }
};

$(document).on('page:change', function() {
  renderNote();
});

$(document).ready(function() {
  setInterval(Browser.updateItemStates, 100);

  $(document).on('click', '#browser .selector', function(e) {
    if (!e.metaKey) {
      e.preventDefault();
      Viewer.load($(this).find('.preview a').attr('href'));
    }
  });

  $(document).on('click', '#browser .selector .destroyer', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var selector = $(this).parents('.selector');
    var preview = selector.find('.preview').text();
    var item_id = selector.data('item-id');

    if (!confirm("Confirm to destroy:\n\n"+preview))
      return;

    Browser.destroy(item_id, $(this).attr('href'));
  });

  $('#filterer input[type=search]').autocomplete({
    source: '/autocomplete',
    appendTo: $('#filterer'),
    delay: 0,
    select: function() {
      var form = $(this).parents('form');
      setTimeout(function() { form.submit() }, 1);
    }
  });
});
