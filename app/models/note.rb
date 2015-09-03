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

  include Note::History
  include Note::Tags
  include Note::Attachments
  include Note::Json
end
