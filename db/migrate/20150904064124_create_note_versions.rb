class CreateNoteVersions < ActiveRecord::Migration
  def change
    create_table :note_versions do |t|
      t.string :title, null: false, default: ''
      t.text :body, null: false, default: ''
      t.datetime :date
      t.string :tag_list
      t.integer :note_id, null: false

      t.timestamps
    end

    Note.unscoped.where(is_history: true).find_each do |history|
      NoteVersion.create!(
        {
          note_id: history.present_id,
          title: history.title,
          body: history.body,
          date: history.date,
          tag_list: Note.unscoped.find_by(id: history.present_id).
            try(:tag_list).try(:split, /\s*,\s*/) || []
        },
        without_protection: true
      )
    end

    Note.unscoped.where(is_history: true).delete_all

    remove_column :notes, :is_history
    remove_column :notes, :present_id
  end
end
