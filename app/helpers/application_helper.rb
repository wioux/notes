module ApplicationHelper
  def current_user
    @current_user
  end

  def tag_color
    @_tag_colors ||= ['#a00', '#050', '#00f']
    @_tag_colors.push(@_tag_colors.shift)[0]
  end

  def display_viewport(item, &block)
    type = item.class.name.downcase

    id = "#{type}/#{item.id || 'new'}"

    if item.new_record?
      url = request.referer
      edit_url = nil
    else
      url = send(:"#{type}_path", item, f: params[:f])
      edit_url = send(:"edit_#{type}_path", item, f: params[:f]) rescue nil
    end

    locals = { item: item, type: type, id: id, url: url, edit_url: edit_url }
    render(layout: 'layouts/viewport/display', locals: locals, &block)
  end

  def form_viewport(item, &block)
    type = item.class.name.downcase

    id = "#{type}/#{item.id || 'new'}"

    if item.new_record?
      url = request.referer
    else
      url = send(:"#{type}_path", item, f: params[:f])
    end

    preview_url = send("preview_#{type.pluralize}_path") rescue nil

    locals = { item: item, type: type, id: id, url: url, preview_url: preview_url }
    render(layout: 'layouts/viewport/edit', locals: locals, &block)
  end
end
