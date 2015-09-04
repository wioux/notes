# == Schema Information
#
# Table name: saved_filters
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  value      :string(255)      not null
#  created_at :datetime
#  updated_at :datetime
#

class SavedFilter < ActiveRecord::Base
  attr_accessible :name, :value
end
