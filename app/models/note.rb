# == Schema Information
#
# Table name: notes
#
#  id            :integer          not null, primary key
#  title         :string(255)
#  body          :text
#  date          :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  original_date :datetime
#  is_history    :boolean          default(FALSE), not null
#  present_id    :integer
#  is_pinned     :boolean          default(FALSE), not null
#

class Note < ActiveRecord::Base
  attr_accessible :body, :date, :title, :tag_list

  has_many :tags, :dependent => :destroy

  has_many :attachments, :dependent => :destroy
  accepts_nested_attributes_for :attachments
  attr_accessible :attachments_attributes

  default_scope { where(:is_history => false) }
  scope :history, -> { where(:is_history => true) }
  scope :with_history, -> { where(:is_history => [true, false]) }

  belongs_to :present, :class_name => 'Note'
  has_many :history, -> { where(:is_history => true) },
           :class_name => 'Note', :foreign_key => 'present_id'

  after_find :create_copy
  before_update :save_copy
  before_save :save_original_date

  def create_copy
    # TODO: note, this doesn't save tag_list
    @copy = history.build(:title => title, :body => body, :date => date)
    @copy.is_history = true
  end

  def save_copy
    @copy.try(:save!)
  end

  def save_original_date
    self.original_date ||= date
  end

  def tag_list
    tags.map(&:label).join(', ')
  end

  def tag_list=(list)
    list = list.split(/\s*,\s*/)
    self.tags = list.map{ |label| tags.build(:label => label) }
  end

  def tagged?(label)
    tags.map(&:label).include?(label)
  end

  def preview(maxlen=40)
    preview = title.blank? ? body : title
    preview = ::MarkdownHTML.render(preview).strip_tags.strip
    preview = preview.gsub(/&#(\d+);/){ |x| x[/\d+/].to_i.chr }
    preview = preview.gsub(/&\w+;/, '')
    preview = preview.size > 45 ? "#{preview[0,45]}..." : "#{preview}"
    lines = preview.split(/\n+/, 2)
    if lines.length > 1
      "#{lines.first.sub(/\W+$/, '')}..."
    else
      lines.first
    end
  end

  def as_json(opts=nil)
    opts ||= {
      :only => [:id, :original_date],
      :include => {
        :tags => {
          :only => [], :methods => :short_label
        },
      },
      :methods => :preview
    }

    super(opts)
  end
end
