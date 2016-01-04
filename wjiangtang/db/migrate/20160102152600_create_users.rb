class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.integer :site_id
      t.string :name
      t.json :info

      t.timestamps null: false
    end
    add_index :users, :site_id
  end
end
