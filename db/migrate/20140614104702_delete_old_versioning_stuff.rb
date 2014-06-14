class DeleteOldVersioningStuff < ActiveRecord::Migration
  def change
    Note.unscoped.where('successor_count > 0').destroy_all
    Note.unscoped.where(:is_history => true).destroy_all

    remove_column(:notes, :derivatives_count)
    remove_column(:notes, :successor_count)
    remove_column(:notes, :original_id)
    remove_column(:notes, :previous_id)
  end
end
