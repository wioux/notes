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
    tags = order('label').uniq.pluck(:label)
    tag_groups = tags.group_by{ |x| x.split(':',2)[0] }
    tag_groups.keys.each{ |x| tag_groups[x].delete x }
    tag_groups.keys.each do |tag|
      tag_groups[tag].map!{ |x| x.split(':',2)[1] }
    end
    tag_groups
  end

  def short_label
    label.split(/:/)[-1]
  end
end
