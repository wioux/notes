class Note
  module Versions
    extend ActiveSupport::Concern

    included do
      has_many :versions, class_name: 'NoteVersion'

      after_find :build_version
      before_update :save_version
      before_save :save_original_date
    end

    def save_version!
      @version.try(:save!)
    end

    private

    def build_version
      params = { title: title, body: body, date: date, note_id: id }
      @version = NoteVersion.new(params, without_protection: true)
    end

    def save_version
      @version.try(:save!) if changed?
    end

    def save_original_date
      self.original_date ||= date
    end
  end
end
