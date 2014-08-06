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
      cond = ''
      @tags.each do |tag|
        cond << ' OR' unless cond.empty?
        cond << '(tags.label = ? OR tags.label LIKE ?)'
      end
      args = [@tags.map{ |t| [t, "#{t}:%"] }].flatten
      @strings.each do |search|
        cond << ' OR ' unless cond.empty?
        cond << '('
        cond << ['notes.title', 'notes.body', 'attachments.file_name'].map do |attr|
          "#{attr} LIKE ?"
        end.join(' OR ')
        cond << ')'
        args << "%#{search}%" << "%#{search}%" << "%#{search}%"
      end
      scope = Note.includes(:tags, :attachments).where(cond, *args)
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
