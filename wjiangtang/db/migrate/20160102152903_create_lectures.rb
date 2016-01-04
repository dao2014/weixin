class CreateLectures < ActiveRecord::Migration
  def change
    create_table :lectures do |t|
      t.string :name
      t.integer :type_id
      t.datetime :begin_at
      t.integer :category_id
      t.string :remark

      t.timestamps null: false
    end
    add_index :lectures, :category_id
  end
end
