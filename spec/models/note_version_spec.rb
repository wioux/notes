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

require 'spec_helper'

RSpec.describe NoteVersion, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
