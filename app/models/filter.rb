class Filter
  attr_reader :user, :tags, :strings, :excluded_tags

  def initialize(string, user: nil)
    @user = user
    @string = string

    @tags = []
    @strings = []
    @excluded_tags = []
    until string.blank?
      if string =~ /\A\s+/
        string = $'
      elsif string =~ /\A\.(\S+)/
        tag, string = $1, $'
        @tags << tag
      elsif string =~ /\A-\.(\S+)/
        tag, string = $1, $'
        @excluded_tags << tag
      elsif string =~ /\A"([^"]+)"/ || string =~ /\A(\S+)/
        search, string = $1, $'
        @strings << search
      end
    end
  end

  def scope
    scope = notes_scope

    if @tags.present? || @strings.present?
      ids = []

      @tags.each do |tag|
        ids.concat tag_matches(tag).pluck(:note_id)
      end

      @strings.each do |string|
        ids.concat note_matches(string).pluck(:id)
        ids.concat attachment_matches(string).pluck(:note_id)
      end

      scope = scope.where(id: ids)
    end

    if excluded_tags.present?
      excludes = excluded_tags.map do |t|
        notes_scope.joins(:tags).tagged(t).ids
      end.flatten

      if excludes.present?
        scope = scope.where("notes.id NOT IN (?)", excludes)
      end
    end

    scope.preload(:tags).order('notes.original_date DESC')
  end

  def notes
    scope
  end

  private

  def note_matches(term)
    notes_scope.where('lower(title) LIKE ? or lower(body) LIKE ?',
                      "%#{term.downcase}%", "%#{term.downcase}%")
  end

  def tag_matches(term)
    tags_scope.where('lower(label) = ? OR lower(label) ILIKE ?',
                     term.downcase, "#{term.downcase}:%")
  end

  def attachment_matches(term)
    Attachment.where('file_name LIKE ?', "%#{term}%")
  end

  def notes_scope
    if user
      Note.where("notes.user_id = ? OR notes.public = ?", user.id, true)
    else
      Note.where(public: true)
    end
  end

  def tags_scope
    if user
      Tag.joins(:note).where("notes.public = ? OR notes.user_id = ?",
                             true, user.id)
    else
      Tag.joins(:note).where(notes: { public: true })
    end
  end
end
