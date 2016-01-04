class CreateLectureUsers < ActiveRecord::Migration
  def change
    create_table :lecture_users do |t|
      t.references :lecture, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
