class CreateAttachments < ActiveRecord::Migration
  def change
    create_table :attachments do |t|
      t.integer :note_id, :null => false
      t.string :location, :null => false
      t.string :file_name, :null => false

      t.timestamps
    end
  end
end
