class Filter
  attr_reader :tags, :strings

  def initialize(string, fields={})
    @string = string
    @unscoped = string.blank?
    @fields = fields

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
      scope = Note.includes(:tags) if @unscoped
    else
      cond = ''
      @tags.each do |tag|
        cond << ' OR' unless cond.empty?
        cond << '(tags.label = ? OR tags.label LIKE ?)'
      end
      args = [@tags.map{ |t| [t, "#{t}:%"] }].flatten
      @strings.each do |search|
        cond << ' OR' unless cond.empty?
        cond << '(notes.title LIKE ? OR notes.body LIKE ?)'
        args << "%#{search}%" << "%#{search}%"
      end
      scope = Note.includes(:tags).where(cond, *args)
    end
    if @order == :version
      scope.where(@fields).order_by_version_date
    else
      scope.where(@fields).order_by_original_date
    end
  end
  def order_by_version_date
    @order = :version
  end
  def order_by_original_date
    @order = :original
  end

  def has_tag?(tag)
    tags.include? tag
  end
  def has_subtag?(sup)
    !tags.select{ |x| x =~ /\A#{sup}:/ }.empty?
  end

  def notes
    scope.where(:successor_count => 0)
  end
end
