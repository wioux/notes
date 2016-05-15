class AddUserIdToNotes < ActiveRecord::Migration
  def up
    add_column :notes, :user_id, :integer, null: false, default: 0

    uid = User.first.id
    Note.all.update_all(user_id: uid)

    change_column_default(:notes, :user_id, nil)
  end

  def down
    remove_column :notes, :user_id
  end
end
