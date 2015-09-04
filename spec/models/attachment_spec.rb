require 'spec_helper'

RSpec.describe Attachment, :type => :model do
  def attachment
    tmp = Tempfile.new(['attachment_test', '.png'])
    upload = ActionDispatch::Http::UploadedFile.new(
      tempfile: tmp,
      filename: 'attachment_test.png'
    )
    params = { uploaded_file: upload, note_id: 1 }
    yield Attachment.create(params, without_protection: true)
  end

  describe '#location' do
    it "should include Rails.env" do
      attachment{ |attach| expect(attach.location).to include(Rails.env) }
    end
  end

  describe '#local_path' do
    it "should be a location on the filesystem" do
      attachment do |attach|
        expect(File.exist?(attach.local_path)).to eq(true)
      end
    end
  end

  describe '#destroy' do
    it "should delete the file" do
      attachment do |attach|
        expect(attach).to receive(:delete_file)
        attach.destroy
      end
    end
  end
end
