class Attachment < ActiveRecord::Base
  attr_accessible :file
  belongs_to :note

  after_destroy :delete_file

  def file=(file)
    data = file.read
    self.file_name = file.original_filename
    digest = Digest::SHA256.new.tap{ |sha| sha << data }.hexdigest
    self.location = "attachments/#{digest}-#{file_name}"

    FileUtils.mkdir_p("#{Rails.root}/files/#{File.dirname(location)}")
    File.open("#{Rails.root}/files/#{location}", 'wb') do |f|
      f.write(data)
    end
  end

  def delete_file
    FileUtils.rm_f("#{Rails.root}/files/#{location}")
  end
end
