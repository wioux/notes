class Filter
  attr_reader :tags, :strings, :options

  def initialize(string, options={})
    @string = string
    @options = options

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
      scope = Note.includes(:tags)
    else
      ids = []
      @tags.each do |tag|
        ids.concat Note.joins(:tags).where('tags.label = ? OR tags.label LIKE ?',
                                           tag, "#{tag}:%").pluck(:id)
      end
      @strings.each do |string|
        ids.concat Note.where('title LIKE ? or body LIKE ?',
                              "%#{string}%", "%#{string}%").pluck(:id)
        ids.concat Note.joins(:attachments).where('attachments.file_name LIKE ?',
                                                  "%#{string}%").pluck(:id)
      end
      scope = Note.preload(:tags).where(:id => ids)
    end

    scope = scope.unpinned unless options[:is_pinned]

    scope.order('notes.original_date DESC')
  end

  def has_tag?(tag)
    tags.include? tag
  end

  def has_subtag?(sup)
    !tags.select{ |x| x =~ /\A#{sup}:/ }.empty?
  end

  def notes
    scope
  end
end
