class AddOriginalIdToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :original_id, :integer
    add_column :notes, :derivatives_count, :integer, :default => 0
  end
end
