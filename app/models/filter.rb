class Filter
  attr_reader :user, :tags, :strings

  def initialize(user, string)
    @user = user
    @string = string

    @tags = []
    @strings = []
    until string.blank?
      if string =~ /\A\s+/
        string = $'
      elsif string =~ /\A\.(\S+)/
        tag, string = $1, $'
        @tags << tag
      elsif string =~ /\A"([^"]+)"/ || string =~ /\A(\S+)/
        search, string = $1, $'
        @strings << search
      end
    end
  end

  def scope
    if @string.blank?
      scope = user.notes.preload(:tags)
    else
      ids = []

      @tags.each do |tag|
        ids.concat tag_matches(tag).pluck(:note_id)
      end

      @strings.each do |string|
        ids.concat note_matches(string).pluck(:id)
        ids.concat attachment_matches(string).pluck(:note_id)
      end

      scope = user.notes.preload(:tags).where(id: ids)
    end

    scope.order('notes.original_date DESC')
  end

  def notes
    scope
  end

  private

  def note_matches(term)
    user.notes.where('title LIKE ? or body LIKE ?', "%#{term}%", "%#{term}%")
  end

  def tag_matches(term)
    user.tags.where('label = ? OR label LIKE ?', term, "#{term}:%")
  end

  def attachment_matches(term)
    Attachment.where('file_name LIKE ?', "%#{term}%")
  end
end
