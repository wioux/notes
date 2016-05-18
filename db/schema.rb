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

ActiveRecord::Schema.define(version: 20160517045653) do

  create_table "attachments", force: :cascade do |t|
    t.integer  "note_id",                  null: false
    t.string   "location",     limit: 255, null: false
    t.string   "file_name",    limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "content_type", limit: 255
  end

  create_table "note_versions", force: :cascade do |t|
    t.string   "title",      limit: 255, default: "", null: false
    t.text     "body",                   default: "", null: false
    t.datetime "date"
    t.string   "tag_list",   limit: 255
    t.integer  "note_id",                             null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "notes", force: :cascade do |t|
    t.string   "title",         limit: 255
    t.text     "body"
    t.datetime "date"
    t.datetime "created_at",                                null: false
    t.datetime "updated_at",                                null: false
    t.datetime "original_date"
    t.integer  "user_id",                                   null: false
    t.boolean  "public",                    default: false, null: false
  end

  create_table "saved_filters", force: :cascade do |t|
    t.string   "name",       limit: 255, null: false
    t.string   "value",      limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tags", force: :cascade do |t|
    t.string   "label",      limit: 255, null: false
    t.integer  "note_id",                null: false
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "login_name",      limit: 255, null: false
    t.string   "password_digest", limit: 255, null: false
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

end
