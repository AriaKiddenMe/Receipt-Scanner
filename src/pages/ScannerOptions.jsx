import React, {useState, useMemo} from 'react';
import {Link} from "react-router-dom";
import "../styles/ScannerOptions.css";
import axios from 'axios'
import Sidebar from '../components/Sidebar'

// This enables the user to manually input their receipt information in the approriate fields and then fill in a
// table for their specific items, quantity/weighted, pricing, and discounts. Once complete, they can hit "Manual" to create
// and store a receipt record in the database for a specific purchase. In addition, they can also upload a
// a scanned copy of their receipt via [.pdf,.png,.jpeg, and .jpg] file types, then hit "Scan" to create
// and store a receipt record in the database for a specific purchase. The upload and scan path relies on the Azure Resource
// to do the OCR reads and return the fields that contain the data needed to generate a receipt record.
const ScannerOptions = () => {
    const [items, setItems] = useState([])
    const cur_user = localStorage.getItem('user')
    function AddItems() {
        var newItems;
        newItems ={Item: "", quantity: 1, price: 0.00, unitType: "qty", type_discount: "percent", discount: 0.00}
        setItems(previous_Items => [...previous_Items, newItems])
    }
    function update(i, field, input) {
        setItems(previous_items => {return previous_items.map((row, k) => 
            {
            if(k === i) {
                const added_row = {...row}
                added_row[field] = input
                return added_row
                }
            else {
                return row
                }
            })
        })
    }
    function remove_item(i) {
        setItems(previous_items => previous_items.filter((row, k) => k !== i))
    }
    function clear(){
        setItems([])
    }
    const handleReceiptSubmission = async(event) => {
        event.preventDefault()
        const formReference = event.target
        const store_name = formReference["store"].value
        const store_location = formReference["location"].value
        const store_phone = formReference["phone"].value
        const purchase_date = formReference["date"].value
        const purchase_time = formReference["time"].value
        const total_price = formReference["totalPrice"].value
        const tax_rate = formReference["rate"].value
        let new_total
        let new_tr
        if (total_price === "" || total_price === null) {
            new_total = "0";
            new_total = Number(new_total)
        }
        else {
            new_total = Number(total_price)
        }
        if (tax_rate === "" || tax_rate === null) {
            new_tr = "0";
            new_tr = Number(new_tr)
        }
        else {
            new_tr = Number(tax_rate)
        }
        const line_items = items
        const tax_holder = new_tr
        let subt = 0
        line_items.forEach((item) => {
            const price_unit = Number(item.price) || 0
            const quantity = Number(item.quantity) || 0
            const discounts = Number(item.discount) || 0
            let discount_applied = 0
            let start_line = price_unit * quantity
            if(item.type_discount === "percent") {
                discount_applied = start_line * (discounts / 100)
            }
            else if(item.type_discount === "amount") {
                discount_applied = discounts
            }
            let item_total = start_line - discount_applied
            if(item_total < 0) {
                item_total = 0
            }
            subt = subt + item_total
        })
        let total_sum = subt + tax_holder
        total_sum = total_sum.toFixed(2)
        new_total = new_total.toFixed(2)
        if (new_total != total_sum) {
            alert('Input total is not equal to computed total. Please try again')
            return
        }
        const data_collection = {
            store_name: store_name,
            store_location: store_location,
            store_phone: store_phone,
            purchase_date: purchase_date,
            purchase_time: purchase_time,
            total_price: new_total,
            tax_rate: new_tr,
            items: line_items,
            generated_by_user: cur_user
        }
        try {
            const response = await axios.post('http://localhost:9000/generateReceiptRecord', data_collection)
            if (response.status === 200 || response.status === 201) {
                alert('Receipt record successfully created and saved')
                clear()
                formReference.reset()
            }
            else {
                alert('Receipt record creation failed. Please try again')
            }
        }
        catch(error) {
            alert('System error occured. Please try again')
        }
    }

    const handleScan = async(event) => {
        event.preventDefault()
        const file_container = document.getElementById("scannedReceiptID")
        if (file_container.files.length === 0) {
            alert('Please upload a file')
            return
        }
        const file = file_container.files[0]
        const forms_data = new FormData()
        forms_data.append("scannedReceipt", file)
        try {
            const response = await axios.post('http://localhost:9000/scanAzureAPI', forms_data, {
            headers: {"Content-Type": "multipart/form-data"}
            })
            if (response.status === 200 || response.status === 201) {
                console.log(JSON.stringify(response.data.fields, null, 2))
                const fields = response.data.fields
                if(!fields || Object.keys(fields).length === 0) {
                    alert ('Unable to read and process receipt')
                    return
                }
                //Values to be extracted from fields after Azure Scan.
                console.log(Object.keys(fields))
                let store_name
                if (fields.MerchantName) {
                    store_name = fields.MerchantName.content
                }
                else {
                    store_name = ""
                }
                let store_location
                if (fields.MerchantAddress) {
                    store_location = fields.MerchantAddress.content
                }
                else {
                    store_location = ""
                }
                let store_phone
                if (fields.MerchantPhoneNumber) {
                    store_phone = fields.MerchantPhoneNumber.content
                }
                else {
                    store_phone = ""
                }
                let purchase_date
                if (fields.TransactionDate) {
                    purchase_date = fields.TransactionDate.content
                }
                else {
                    purchase_date = ""
                }
                let purchase_time
                if (fields.TransactionTime) {
                    purchase_time = fields.TransactionTime.content
                }
                else {
                    purchase_time = ""
                }
                let total_price = 0
                if (fields.Total && fields.Total.valueCurrency) {
                    total_price = fields.Total.valueCurrency.amount
                }
                else {
                    total_price = 0
                }
                let tax_rate = 0
                if (fields.TotalTax && fields.TotalTax.valueCurrency) {
                    tax_rate = fields.TotalTax.valueCurrency.amount
                }
                else if (fields.Tax && fields.Tax.valueCurrency) {
                    tax_rate = fields.Tax.valueCurrency.amount
                }
                else {
                    tax_rate = 0
                }
                let items = []
                if(fields.Items && fields.Items.valueArray) {
                    for (var entry of fields.Items.valueArray) {
                        let container = entry.valueObject
                        let item_name = ""
                        if(container.Description) {
                            item_name = container.Description.content
                        }
                        else if (container.Name){
                            item_name = container.Name.content
                        }
                        let qty = 1
                        if(container.Quantity && container.Quantity.valueNumber) {
                            qty = container.Quantity.valueNumber    
                        }
                        let unitType = "qty"
                        if(qty % 1 != 0) {
                            unitType = "lb"
                        }
                        let price = 0
                        if(container.Price && container.Price.valueCurrency) {
                            price = container.Price.valueCurrency.amount
                        }
                        else if(container.TotalPrice && container.TotalPrice.valueCurrency) {
                            price = container.TotalPrice.valueCurrency.amount   
                        }
                        let row = {
                            Item: item_name,
                            quantity: qty,
                            price: price,
                            unitType: unitType,
                            type_discount: "none",
                            discount: 0 
                        }
                        items.push(row)
                    }
                }
                else {
                    items = []
                }   
                const data_collection = {
                    store_name: store_name,
                    store_location: store_location,
                    store_phone: store_phone,
                    purchase_date: purchase_date,
                    purchase_time: purchase_time,
                    total_price: total_price,
                    tax_rate: tax_rate,
                    items: items,
                    generated_by_user: cur_user
                }  
                try {
                    const response_record = await axios.post('http://localhost:9000/generateReceiptRecord', data_collection)
                        if (response_record.status === 200 || response_record.status === 201) {
                            alert('Receipt record successfully created and saved')
                            clear()
                            file_container.value = ""
                        }
                    else {
                        alert('Receipt record creation failed. Please try again')
                    }
                }
                catch(error) {
                    alert('System error occured. Please try again')
                }
                          
            }
        }
        catch(error) {
            alert('System error occured. Please try again')
        }
    }
    return(
        <div className="layout">
        <Sidebar/>
        <div className="content">
        <div className="receipt-page">
            <div className="container">
            <div className="card header">
                <h1 className="title">Record A Receipt</h1>
            </div>
            <div className="card">
                <form onSubmit ={handleReceiptSubmission}>
                    <div className="gridding">
                        <div className="fields">
                            <span className="label"></span>
                            <input className="hidden" type="file" id="scannedReceiptID" name="scannedReceipt" accept=".pdf,.png,.jpeg,.jpg"/>
                            <label htmlFor="scannedReceiptID" className="upload" aria-label="Upload scanned receipt"> Upload a Receipt...⬆️</label>
                        </div>
                        <button type="button" className="scanner-btn" onClick={handleScan}>Scan</button>
                        <div className="fields">
                            <label className="label">Store Name:</label>
                            <input className="input_and_select" type="text" name="store" placeholder="Name of store (example: Whole Foods)"/>
                        </div>
                        <div className="fields">
                            <label className="label">Store Location:</label>
                            <input className="input_and_select" type="text" name="location" placeholder="Location"/>
                        </div>
                        <div className="fields">
                            <label className="label">Store Phone Number:</label>
                            <input className="input_and_select" type="text" name="phone" placeholder="Phone Number"/>
                        </div>
                        <div className="fields">
                            <label className="label">Date of Purchase:</label>
                            <input className="input_and_select" type="date" name="date" required/>
                        </div>
                        <div className="fields">
                            <label className="label">Time of Purchase:</label>
                            <input className="input_and_select" type="time" name="time" required/>
                        </div>
                        <div className="fields">
                            <label className="label">Total Price:</label>
                            <input className="input_and_select" type="number" name="totalPrice" min="0" step="0.01"/>
                        </div>
                        <div className="fields">
                            <label className="label">Tax Amount:</label>
                            <input className="input_and_select" type="number" name="rate" min="0" step="0.01" placeholder="Tax"/>
                        </div>
                    </div>
                    <div className="toolbar">
                        <button type="button" onClick={AddItems}>+Add Item</button>
                        <button type="button" onClick={clear}>Clear All</button>
                        <button type="submit">Manual</button>

                    </div>
                    <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table-header col-item" scope="col">Item</th>
                                <th className="table-header col-qty" scope="col">Qty/lbs</th>
                                <th className="table-header col-type" scope="col">Type</th>
                                <th className="table-header col-price" scope="col">Unit Price</th>
                                <th className="table-header col-discountType" scope="col">Discount</th>
                                <th className="table-header col-remove" scope="col">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row, index) => (
                            <tr key={index} className="table-tr">
                                <td className="table-data-cells">
                                    <input className="table-input_and_select" type ="text" value={row.Item} onChange={(e)=>update(index, "Item", e.target.value)}/>
                                </td>
                                <td className="table-data-cells">
                                    <input className="table-input_and_select" type="number" min="0" step="0.01" value={row.quantity} onChange={(e)=>update(index, "quantity", e.target.value)}/>
                                </td>
                                <td className="table-data-cells"><select className="table-input_and_select" value={row.unitType || "qty"} onChange={(e)=>update(index, "unitType", e.target.value)}>
                                    <option value="qty">qty</option>
                                    <option value="lb">lbs</option></select></td>
                                <td className="table-data-cells">
                                    <input className="table-input_and_select" type="number" min="0" step="0.01" value={row.price} onChange={(e)=>update(index, "price", e.target.value)}/>
                                </td>
                                <td className="table-data-cells">
                                    <select className="table-input_and_select" value={row.type_discount} onChange={(e)=>update(index, "type_discount", e.target.value)}>
                                        <option value="percent"> Percent </option>
                                        <option value="amount">Amount</option>
                                    </select>
                                    <input className="table-input_and_select" type="number" min="0" step="0.01" value={row.discount} onChange={(e)=>update(index, "discount", e.target.value)}/>
                                </td>
                                <td className="table-data-cells col-remove">
                                    <button className="btn-icon" type="button" onClick={(e)=>remove_item(index)} aria-label="Remove item">🗑️</button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                    </div>
                </form>
            </div>
            </div>
        </div>
        </div>
        </div>
    );
};
export default ScannerOptions;