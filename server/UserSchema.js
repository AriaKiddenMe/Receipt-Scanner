// Framework for the document, or format of a user record to be stored in the collection "Users" in
// the Mongo Database. Has the form fields: f_name for first name, l_name = last name, username, and password.


const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    f_name: String,
    l_name: String,
    username: String,
    passwordHash: String,
    preferred_brands: [String], 
    banned_brands: [String], 
    allergens: [String]
});

const User = mongoose.model("User", UserSchema, "UserRecords");

module.exports = User;