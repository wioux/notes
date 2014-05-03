class AddPreviousIdToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :previous_id, :integer
    add_column :notes, :successor_count, :integer, :default => 0
    add_column :notes, :original_date, :datetime
  end
end
