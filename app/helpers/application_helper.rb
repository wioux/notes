module ApplicationHelper
  def current_user
    @current_user
  end

  def controls(cond=true, &block)
    item_actions = capture(&block) if cond && block_given?
    item_actions = item_actions.presence.try(:+, content_tag(:hr))

    controls = []
    controls << content_tag(:div, "class": "navigate") do
      content = content_tag(:div, id: "item_actions"){ item_actions }
      content << content_tag(:a, "", "href": root_path,
                                     "class": "glyphicon glyphicon-book",
                                     "title": "Browse all notes")
      content << content_tag(:a, "", "href": new_note_path(f: params[:f]),
                                     "class": "glyphicon glyphicon-plus",
                                     "data-new-action": true,
                                     "title": "Create a note") if logged_in?
      content << content_tag(:hr)
    end

    controls << content_tag(:span, "", "class": "glyphicon glyphicon-user",
                                       "title": "Your account")
    if logged_in?
      controls << content_tag(:a, "", "href": "/settings",
                                      "class": "glyphicon glyphicon-cog",
                                      "title": "Settings")
      controls << content_tag(:a, "", "href": logout_path,
                                      "class": "glyphicon glyphicon-log-out",
                                      "title": "Log out",
                                      "data-logout": true)
    else
      controls << content_tag(:a, "", "href": login_path,
                              "title": "Log in",
                              "class": "glyphicon glyphicon-log-in")
    end

    content_tag(:div, id: "controls"){ controls.join.html_safe }
  end

  def tag_labels
    if logged_in?
      Tag.joins(:note).where("notes.public = ? OR notes.user_id = ?",
                             true, current_user.id).labels
    else
      Tag.joins(:note).where(notes: { public: true }).labels
    end
  end
end
