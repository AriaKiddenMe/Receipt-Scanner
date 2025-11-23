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
    purchase_date: String,
    purchase_time: String,
    total_price: Number,
    tax_rate: Number,
    items: [ItemSchema],
    //generated_by_user: String,
    generatedTime: {type: Date, default: Date.now},
});
const Receipt = mongoose.model("Receipt", ReceiptSchema, "Receipts");
module.exports = Receipt;

