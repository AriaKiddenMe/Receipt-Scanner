import React, {useState, useMemo} from 'react';
import {Link} from "react-router-dom";
import "../styles/ScannerOptions.css";
const ScannerOptions = () => {
    const [items, setItems] = useState([])
    function AddItems() {
        var newItems;
        newItems ={Item: "", quantity: 1, price: 0.00, type_discount: "percent", discount: 0.00}
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
    return(
        <div className="alternating">
        <div className="receipt-page">
            <div className="container">
            <div className="card header">
                <h1 className="title">Record A Receipt</h1>
            </div>
            <div className="card">
                <form>
                    <div className="gridding">
                        <div className="fields">
                            <label className="label">Upload Scanned Receipt:</label>
                            <input className="input_and_select" type="file" name="scannedReceipt" accept=".pdf,.png,.jpeg,.jpg"/>
                        </div>
                        <div className="fields">
                            <label className="label">Store Name:</label>
                            <input className="input_and_select" type="text" name="store" placeholder="Name of store (example: Whole Food's)"/>
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
                            <label className="label">Tax Rate:</label>
                            <input className="input_and_select" type="number" name="rate" min="0" step="0.01" placeholder="Tax %"/>
                        </div>
                    </div>
                    <div className="toolbar">
                        <button type="button" onClick={AddItems}>+Add Item</button>
                        <button type="button" onClick={clear}>Clear All</button>
                        <button type="submit">Submit</button>

                    </div>
                    <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table-header col-item" scope="col">Item</th>
                                <th className="table-header col-qty" scope="col">Qty</th>
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
                                    <input className="table-input_and_select" type="number" min="1" step="1" value={row.quantity} onChange={(e)=>update(index, "quantity", e.target.value)}/>
                                </td>
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
                                <td className="table-data-cells">
                                    <button className="btn-icon" type="button" onClick={(e)=>remove_item(index)}>Remove</button>
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
    );
};
export default ScannerOptions;