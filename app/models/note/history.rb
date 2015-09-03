class Note
  module History
    extend ActiveSupport::Concern

    included do
      default_scope { where(:is_history => false) }
      scope :history, -> { where(:is_history => true) }
      scope :with_history, -> { where(:is_history => [true, false]) }

      belongs_to :present, :class_name => 'Note'
      has_many :history, -> { where(:is_history => true) },
               :class_name => 'Note', :foreign_key => 'present_id'

      after_find :create_copy
      before_update :save_copy
      before_save :save_original_date
    end

    private

    def create_copy
      # TODO: note, this doesn't save tag_list
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
