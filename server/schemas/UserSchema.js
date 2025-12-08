// Framework for the document, or format of a user record to be stored in the collection "UserRecords" in
// the Mongo Database. Has the form fields: f_name for first name, l_name for last name, username, passwordHash for
// hashed password, preferred_brands, banned_brands, and allergens.


const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  f_name: String,
  l_name: String,
  username: String,
  passwordHash: String,
  searchParameters: {
    default_distance: Number,
    default_distance_unit: String,
    default_max_stores: Number,
    default_transport: String,
    default_prioritize_favorites: Boolean,
    user_favorite_stores: [String], //Syntax(via EBNF) STORE_NAME '(' STORE_ADDRESS ')'

    preferred_brands: [String],
    banned_brands: [String],
    banned_allergens: [String],
    privacy_flag: Boolean,
  },
  default_item_unit_order: [String],
  preferred_brands: [String],
  banned_brands: [String],
  allergens: [String],
  receipts_public: Boolean
});

const User = mongoose.model("User", UserSchema, "UserRecords");

module.exports = User;