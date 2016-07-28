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
#  user_id       :integer          not null
#

class Note < ActiveRecord::Base
  attr_accessible :body, :date, :public, :title, :tag_list

  belongs_to :user

  include Note::Versions
  include Note::Tags
  include Note::Attachments
  include Note::Json
  include Note::Content
end
