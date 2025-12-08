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
        default_distance: {type: Number, default: 20},
        default_distance_unit:  {type: String, enum: ["minutes", "mi", "km"]},
        default_max_stores: {type: Number, default: 1},
        default_transport: {type: String, enum: ["by the crow (straight line)", "driving", "walking", "biking", "public transit"]},
        default_prioritize_favorites: {type: Boolean, default:false},
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