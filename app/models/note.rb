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
#  is_history        :boolean          default(FALSE), not null
#  present_id        :integer
#

class Note < ActiveRecord::Base
  attr_accessible :body, :date, :title, :tag_list
  validates_presence_of :body

  has_many :tags, :dependent => :destroy

  default_scope { where(:is_history => false) }
  belongs_to :present, :class_name => 'Note'
  has_many :history, -> { where(:is_history => true) },
           :class_name => 'Note', :foreign_key => 'present_id'

  after_find :create_copy
  before_update :save_copy

  def create_copy
    # TODO: note, this doesn't save tag_list
    @copy = history.build(:title => title, :body => body, :date => date)
    @copy.is_history = true
  end

  def save_copy
    @copy.try(:save!)
  end


  before_save :save_original_date

  def save_original_date
    self.original_date ||= date
  end

  def original
    super || self
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

  scope :order_by_original_date, -> { order('notes.original_date DESC') }

  scope :order_by_version_date, -> { order('notes.date DESC') }
end
