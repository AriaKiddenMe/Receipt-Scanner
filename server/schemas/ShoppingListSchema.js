/**
 * Framework for the document, or format of a shoppinglist record to be stored in the collection
 * "ShoppingLists" in the Mongo Database. Has the form fields:
 *  owner_id:   for the id of the user whom owns it,
 *  list_name:  name of the list
 *  items:      for the items and quantities within the list
 */
const mongoose = require("mongoose");

const ShoppingListEntry = new mongoose.Schema({
    entry_name: String,
    entry_quantity: Number,
    entry_unit_type: String
})

const ShoppingListSchema = new mongoose.Schema({
    owner_id: String,
    list_name: String,
    listItems: [ShoppingListEntry],
});

const ShoppingList = mongoose.model("ShoppingList", ShoppingListSchema, "ShoppingLists");

module.exports = ShoppingList;