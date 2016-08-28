module ApplicationHelper
  def current_user
    @current_user
  end

  def actions(cond=true, &block)
    item_actions = capture(&block) if cond && block_given?
    item_actions = item_actions.presence.try(:+, content_tag(:hr))

    actions = []
    actions << content_tag(:div, "class": "navigate") do
      content = content_tag(:div, id: "item_actions"){ item_actions }
      content << content_tag(:a, "", "href": "#browser",
                                     "class": "fa fa-search",
                                     "data-search-action": true,
                                     "title": "Search notes")
      content << content_tag(:a, "", "href": new_note_path(f: params[:f]),
                                     "class": "fa fa-plus",
                                     "data-new-action": true,
                                     "title": "Create a note") if logged_in?
      content << content_tag(:hr)
    end

    actions << content_tag(:span, "", "class": "fa fa-user",
                                      "title": "Your account")
    if logged_in?
      actions << content_tag(:a, "", "href": "/settings",
                                     "class": "fa fa-cog",
                                     "title": "Settings")
      actions << content_tag(:a, "", "href": logout_path,
                                     "class": "fa fa-sign-out",
                                     "title": "Log out",
                                     "data-logout": true)
    else
      actions << content_tag(:a, "", "href": login_path,
                             "title": "Log in",
                             "class": "fa fa-sign-in")
    end

    content_tag(:div, class: "browser-app-actions"){ actions.join.html_safe }
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
