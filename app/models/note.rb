class Note < ActiveRecord::Base
  attr_accessible :body, :date, :title
  validates_presence_of :body

  has_many :tags, :dependent => :destroy
  
  has_many :derivatives, :class_name => 'Note', :foreign_key => 'original_id'
  belongs_to :original, :class_name => 'Note', :counter_cache => 'derivatives_count'

  has_many :successors, :class_name => 'Note', :foreign_key => 'previous_id'
  belongs_to :previous, :class_name => 'Note', :counter_cache => 'successor_count'

  def original
    super || self
  end

  after_initialize do
    if new_record? && previous_id
      self.original_id = previous.original_id
      self.original_date = previous.original_date
      self.title ||= previous.title
      self.body ||= previous.body
      self.tag_list = previous.tag_list if tag_list.blank?
    end
  end
  before_save do
    self.original_date ||= self.date
  end

  attr_accessible :tag_list
  def tag_list
    tags.map(&:label).join(', ')
  end
  def tag_list=(list)
    list = list.split(/\s*,\s*/)
    list.map{ |label| tags.build(:label => label) }
  end

  def preview(maxlen=40)
    preview = title.blank? ? body : title
    preview = ::MarkdownHTML.render(preview).strip_tags.strip
    preview = preview.size > 45 ? "#{preview[0,45]}..." : "#{preview}"
    lines = preview.split(/\n+/, 2)
    lines.length > 1 ? "#{lines.first}..." : lines.first
  end

  def self.filter(string=nil)
    return Note.includes(:tags) if string.blank?

    tags = []
    strings = []
    until string.blank?
      if string =~ /\A\s+/
        string = $'
      elsif string =~ /\A\.(\S+)/
        tag, string = $1, $'
        tags << tag
      elsif string =~ /\A"([^"]+)"/ || string =~ /\A(\S+)/
        search, string = $1, $'
        strings << search
      end
    end

    cond = ''
    tags.each do |tag|
      cond << ' OR' unless cond.empty?
      cond << '(tags.label = ? OR tags.label LIKE ?)'
    end
    args = [tags.map{ |t| [t, "#{t}:%"] }].flatten
    strings.each do |search|
      cond << ' OR' unless cond.empty?
      cond << '(notes.title LIKE ? OR notes.body LIKE ?)'
      args << "%#{search}%" << "%#{search}%"
    end
    Note.includes(:tags).where(cond, *args)
  end

  scope :order_by_original_date,
     order('strftime("%Y/%m/%d", notes.original_date) DESC, strftime("%H:%M:%f", notes.original_date) ASC')

  scope :order_by_version_date, order('notes.date DESC')
end
