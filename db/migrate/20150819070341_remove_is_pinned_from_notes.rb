class RemoveIsPinnedFromNotes < ActiveRecord::Migration
  def change
    remove_column :notes, :is_pinned
  end
end
