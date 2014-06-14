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
end
