class Contact
  include MongoMapper::Document

  key :name, String
  key :title, String
  key :default_email, String
  key :default_call_phone, String
  key :default_txt_phone, String
  key :phones, Array
  key :emails, Array

  validates_presence_of :name
end
