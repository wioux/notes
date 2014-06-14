class AddIsHistoryToNote < ActiveRecord::Migration
  def change
    add_column :notes, :is_history, :boolean, :null => false, :default => false
    add_column :notes, :present_id, :integer

    Note.unscoped.where('successor_count > 0').find_each do |note|
      note.update_column(:is_history, true)
    end
    
    Note.unscoped.find_each do |note|
      current_version = note
      current_version = current_version.successors.first while current_version.successors.first
      note.update_column(:present_id, current_version.id)
    end
  end
end
