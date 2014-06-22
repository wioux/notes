class AddIsPinnedToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :is_pinned, :boolean, :null => false, :default => false
  end
end
