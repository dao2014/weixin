class AddWxTokenToSite < ActiveRecord::Migration
  def change
    add_column :sites, :wx_token, :string
  end
end
