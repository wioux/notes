# == Schema Information
#
# Table name: notes
#
#  id                :integer          not null, primary key
#  title             :string(255)
#  body              :text
#  date              :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  original_id       :integer
#  derivatives_count :integer          default(0)
#  previous_id       :integer
#  successor_count   :integer          default(0)
#  original_date     :datetime
#

class Note < ActiveRecord::Base
  attr_accessible :body, :date, :title, :tag_list
  validates_presence_of :body

  has_many :tags, :dependent => :destroy
  
  has_many :derivatives, :class_name => 'Note', :foreign_key => 'original_id'
  belongs_to :original, :class_name => 'Note', :counter_cache => 'derivatives_count'

  has_many :successors, :class_name => 'Note', :foreign_key => 'previous_id'
  belongs_to :previous, :class_name => 'Note', :counter_cache => 'successor_count'

  scope :current_versions, -> { where(:successor_count => 0) }

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

  def tag_list
    tags.map(&:label).join(', ')
  end

  def tag_list=(list)
    list = list.split(/\s*,\s*/)
    self.tags = list.map{ |label| tags.build(:label => label) }
  end

  def preview(maxlen=40)
    preview = title.blank? ? body : title
    preview = ::MarkdownHTML.render(preview).strip_tags.strip
    preview = preview.size > 45 ? "#{preview[0,45]}..." : "#{preview}"
    lines = preview.split(/\n+/, 2)
    lines.length > 1 ? "#{lines.first}..." : lines.first
  end

  scope :order_by_original_date, -> {
     order('strftime("%Y/%m/%d", notes.original_date) DESC, strftime("%H:%M:%f", notes.original_date) ASC')
  }
  scope :order_by_version_date, -> {
    order('notes.date DESC')
  }
end
