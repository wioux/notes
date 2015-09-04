# == Schema Information
#
# Table name: note_versions
#
#  id         :integer          not null, primary key
#  title      :string(255)      default(""), not null
#  body       :text             default(""), not null
#  date       :datetime
#  tag_list   :string(255)
#  note_id    :integer          not null
#  created_at :datetime
#  updated_at :datetime
#

class NoteVersion < ActiveRecord::Base
  belongs_to :note

  serialize :tag_list, Array

  before_save :copy_tag_list_from_note

  private

  def copy_tag_list_from_note
    self.tag_list = (note.try(:tags) || []).map(&:label)
  end
end
