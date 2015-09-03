# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  label      :string(255)      not null
#  note_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Tag < ActiveRecord::Base
  attr_accessible :label

  belongs_to :note

  def self.labels
    tags = uniq.order(:label).pluck(:label)
    tags.each do |tag|
      parts = tag.split(':')
      (parts.size - 1).times do |i|
        tags << parts[0..i].join(':')
      end
    end
    tags.uniq.sort
  end

  def self.autocomplete(term)
    Tag.uniq.where('tags.label like ?', "%#{term}%").
      where('tags.label != ?', term).order(:label).pluck(:label)
  end

  def short_label
    label.split(/:/)[-1]
  end
end
