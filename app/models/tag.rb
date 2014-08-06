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

  def self.groups
    tags = order('tags.label').uniq.pluck(:label)

    tag_groups = tags.group_by{ |x| x.split(':',2)[0] }

    tag_groups.keys.each{ |x| tag_groups[x].delete x }

    tag_groups.keys.each do |tag|
      tag_groups[tag].map!{ |x| x.split(':',2)[1] }
    end

    tag_groups
  end

  def self.labels
    tags = uniq.pluck(:label).sort
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
      where('tags.label != ?', term).pluck(:label)
  end

  def short_label
    label.split(/:/)[-1]
  end
end
