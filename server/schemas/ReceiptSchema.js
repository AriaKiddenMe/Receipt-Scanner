// Framework for the document, or format of a receipt record to be stored in the collection "Receipts" in
// the Mongo Database. Has the form fields: store_name, store_location, store_phone, purchase_date, purchase_time,
// total_price, tax_rate, items, generated_by_user, and generatedTime. With items holding an item array, its format
// for each item being Item, quantity, price, unitType, type_discount, and discount.

const mongoose = require("mongoose")

const ItemSchema = new mongoose.Schema({
    Item: String,
    quantity: Number,
    price: Number,
    unitType: {type: String, enum: ["qty", "lb"], default: "qty"},
    type_discount: String,
    discount: Number,},
    {_id: false}
);

const ReceiptSchema = new mongoose.Schema( {
    store_name: String,
    store_location: String,
    store_phone: String,
    purchase_date: { type: Date },
    purchase_time: String,
    total_price: Number,
    tax_rate: Number,
    items: [ItemSchema],
    generated_by_user: String,
    generatedTime: {type: Date, default: Date.now},
    public: Boolean
});
const Receipt = mongoose.model("Receipt", ReceiptSchema, "Receipts");
module.exports = Receipt;
