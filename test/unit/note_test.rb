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

require 'test_helper'

class NoteTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
