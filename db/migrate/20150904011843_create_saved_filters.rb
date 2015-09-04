class CreateSavedFilters < ActiveRecord::Migration
  def change
    create_table :saved_filters do |t|
      t.string :name, null: false
      t.string :value, null: false

      t.timestamps
    end
  end
end
