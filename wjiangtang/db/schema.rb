# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160102153600) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string   "name"
    t.integer  "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "lecture_details", force: :cascade do |t|
    t.integer  "lecture_id"
    t.integer  "type_id"
    t.string   "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "lecture_details", ["lecture_id"], name: "index_lecture_details_on_lecture_id", using: :btree

  create_table "lecture_users", force: :cascade do |t|
    t.integer  "lecture_id"
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "lecture_users", ["lecture_id"], name: "index_lecture_users_on_lecture_id", using: :btree
  add_index "lecture_users", ["user_id"], name: "index_lecture_users_on_user_id", using: :btree

  create_table "lectures", force: :cascade do |t|
    t.string   "name"
    t.integer  "type_id"
    t.datetime "begin_at"
    t.integer  "category_id"
    t.string   "remark"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "lectures", ["category_id"], name: "index_lectures_on_category_id", using: :btree

  create_table "sites", force: :cascade do |t|
    t.string   "name"
    t.string   "wx_app_id"
    t.string   "wx_app_secret"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.string   "wx_token"
  end

  create_table "users", force: :cascade do |t|
    t.integer  "site_id"
    t.string   "name"
    t.json     "info"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "users", ["site_id"], name: "index_users_on_site_id", using: :btree

  add_foreign_key "lecture_details", "lectures"
  add_foreign_key "lecture_users", "lectures"
  add_foreign_key "lecture_users", "users"
end
