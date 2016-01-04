class CreateSites < ActiveRecord::Migration
  def change
    create_table :sites do |t|
      t.string :name
      t.string :wx_app_id
      t.string :wx_app_secret

      t.timestamps null: false
    end
  end
end
