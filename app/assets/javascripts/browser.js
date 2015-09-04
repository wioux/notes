
Browser = {
  focus: function() {
    $('#filterer input').focus().select();
  },

  load: function(url) {
    Turbolinks.visit(url, { change: 'sidebar' });
  },

  updateItemStates: function() {
    var selected = Viewer.itemId();
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
  },

  beginSavingFilter: function() {
    var form = $('#filterer form.filter_mode');
    var field = form.find('input[name=f]');
    var value = field.val();

    form.data('saved_filter', value);
    form.removeClass('filter_mode').addClass('filter_save_mode');

    field.val('');
    field.attr('placeholder', 'Save "'+value+'" as...');
    field.focus();
  },

  abortSavingFilter: function(onlyIfBlank) {
    var form = $('#filterer form.filter_save_mode');
    var field = form.find('input[name=f]');
    var value = form.data('saved_filter');

    form.data('saved_filter', null);
    field.attr('placeholder', null);
    form.removeClass('filter_save_mode').addClass('filter_mode');
    field.val(value);
    field.blur()
  },

  finishSavingFilter: function() {
    var form = $('#filterer form.filter_save_mode');
    var field = form.find('input[name=f]');
    var value = form.data('saved_filter');
    var name = field.val();

    $.ajax({
      method: 'POST',
      url: '/saved_filters',
      data: {
        saved_filter: {
          name: name,
          value: value
        }
      },

      success: function(response) {
        Turbolinks.replace(response, { change: 'sidebar' });
      }
    });
  }
};

$(document).on('page:change', function() {
  $('#filterer input[type=search]').autocomplete({
    source: '/autocomplete',
    appendTo: $('#filterer'),
    autoFocus: true,
    delay: 0,
    open: function(e, ui) {
      if (!$(this).parents('.filter_mode')[0]) {
        $(this).autocomplete('close');
      }
    },
    select: function() {
      var form = $(this).parents('form');
      setTimeout(function() { form.submit() }, 1);
    }
  });
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

  $(document).on('click', '#filterer form.filter_mode #filter-clearer', function(e) {
    e.preventDefault();
    Browser.load(window.location.pathname, false);
  });

  $(document).on('click', '#filterer form.filter_mode #filter-saver', function(e) {
    e.preventDefault();
    Browser.beginSavingFilter();
  });

  $(document).on('submit', '#filterer form.filter_save_mode', function(e) {
    e.preventDefault();
    Browser.finishSavingFilter();
  });

  $(document).on('blur', '#filterer form.filter_save_mode', function(e) {
    e.preventDefault();
    Browser.abortSavingFilter();
  });

  $(document).on('keydown', '#filterer form.filter_save_mode', function(e) {
    if (e.keyCode == 27) { // escape
      var form = $('#filterer form.filter_save_mode');
      var field = form.find('input[name=f]');
      if (field.val().length == 0) {
        e.preventDefault();
        Browser.abortSavingFilter();
      }
    }
  });

  $(document).on('submit', '#filterer form.filter_mode', function(e) {
    e.preventDefault();
    Browser.load($(this).attr('action') + '?' + $(this).serialize());
  });
});
