module NotesHelper
  def tag_link(base_url, tag)
    links = '<span class="tag-links">'
    tag.split(':').inject('') do |prefix, part|
      tag = (prefix.blank? ? '' : prefix+':') + part
      links << (prefix.blank? ? '' : ':')
      links << link_to(part, base_url+tag, 'data-tag' => tag)
      tag
    end
    (links << '</span>').html_safe
  end

  def attachment_link(attachment)
    content_tag(:span, :class => 'attachment-link') do
      content_tag(:a, :href => url_for(attachment)){ attachment.file_name }
    end
  end

  def attachment_edit(form)
    if form.object.new_record?
      content_tag(:div){ form.file_field :file, :style => 'margin-top: 8px' }
    else
      content_tag(:div){ content_tag :strong, form.object.file_name }
    end
  end

  def tag_selector_button(note, tag)
    css_class = 'btn btn-default btn-sm'
    css_class << ' active' if note.tagged?(tag)
    content_tag(:span, :class => css_class,
                :"data-toggle" => 'button'){ tag }
  end
end
