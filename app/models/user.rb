# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  login_name      :string(255)      not null
#  password_digest :string(255)      not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class User < ActiveRecord::Base
  def self.authenticate(name, password)
    find_by_login_name(name).try(:verify, password)
  end
  def verify(password)
    BCrypt::Password::new(password_digest) == password
  end

  attr_accessor :password
  before_save :compute_password_digest, :unless => proc{ |u| u.password.blank? }
  def compute_password_digest
    self.password_digest = BCrypt::Password.create(password, :cost => 11)
  end
end
