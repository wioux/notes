module ApplicationHelper
  def current_user
    @current_user
  end

  def tag_color
    @_tag_colors ||= ['#a00', '#050', '#00f']
    @_tag_colors.push(@_tag_colors.shift)[0]
  end
end
