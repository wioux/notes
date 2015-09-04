class Note
  module History
    extend ActiveSupport::Concern

    # TODO: note, tags are destroyed in historical notes

    included do
      default_scope { without_history }
      scope :history, -> { where(:is_history => true) }
      scope :with_history, -> { where(:is_history => [true, false]) }
      scope :without_history, -> { where(is_history: false) }

      belongs_to :present, :class_name => 'Note'
      has_many :history, -> { where(:is_history => true) },
               :class_name => 'Note', :foreign_key => 'present_id'

      after_find :create_copy
      before_update :save_copy
      before_save :save_original_date
    end

    def become_history(present_id=id)
      self.is_history = true
      self.present_id = present_id
      save
    end

    private

    def create_copy
      @copy = history.build(:title => title, :body => body, :date => date)
      @copy.is_history = true
    end

    def save_copy
      @copy.try(:save!)
    end

    def save_original_date
      self.original_date ||= date
    end
  end
end
