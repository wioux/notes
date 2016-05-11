module ApplicationHelper
  def current_user
    @current_user
  end

  def controls(&block)
    item_actions = capture(&block) if block_given?
    item_actions = item_actions.presence.try(:+, content_tag(:hr))

    controls = []
    controls << content_tag(:div, id: "item_actions"){ item_actions }
    controls << content_tag(:span, "", "class": "glyphicon glyphicon-user",
                                       "title": "Your account")
    controls << content_tag(:a, "", "href": "/settings",
                                    "class": "glyphicon glyphicon-cog",
                                    "title": "Settings")
    controls << content_tag(:a, "", "href": logout_path,
                                    "class": "glyphicon glyphicon-arrow-left",
                                    "title": "Log out")

    content_tag(:div, id: "controls"){ controls.join.html_safe }
  end
end
