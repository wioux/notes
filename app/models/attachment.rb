# == Schema Information
#
# Table name: attachments
#
#  id           :integer          not null, primary key
#  note_id      :integer          not null
#  location     :string(255)      not null
#  file_name    :string(255)      not null
#  created_at   :datetime
#  updated_at   :datetime
#  content_type :string(255)
#

class Attachment < ActiveRecord::Base
  attr_accessible :uploaded_file
  belongs_to :note

  after_destroy :delete_file

  def local_path
    "#{Rails.root}/files/#{location}"
  end

  def uploaded_file=(file)
    data = file.read
    self.file_name = file.original_filename
    digest = Digest::SHA256.new.tap{ |sha| sha << data }.hexdigest
    self.location = "#{Rails.env}/attachments/#{digest}-#{file_name}"
    self.content_type = file.content_type

    FileUtils.mkdir_p("#{Rails.root}/files/#{File.dirname(location)}")
    File.open("#{Rails.root}/files/#{location}", 'wb') do |f|
      f.write(data)
    end
  end

  def delete_file
    FileUtils.rm_f(local_path)
  end
end
