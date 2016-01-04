class CreateLectureDetails < ActiveRecord::Migration
  def change
    create_table :lecture_details do |t|
      t.references :lecture, index: true, foreign_key: true
      t.integer :type_id
      t.string :content

      t.timestamps null: false
    end
  end
end
