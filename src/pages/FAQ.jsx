import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/FAQ.css";

const faqs = [
  { q: "How do I record a receipt?", a: "Use the 'Record Receipt' page to add receipts manually or scan them." },
  { q: "How do I see my spending analytics?", a: "Go to 'Spending Analytics', choose a date range, and click Display." },
  { q: "Can I edit a receipt after adding it?", a: "Currently, editing is not supported." },
  { q: "What file types can I upload for scanning?", a: "You can upload PDF, PNG, JPEG, or JPG files." },
  { q: "Why isn’t my scanned receipt showing correctly?", a: "Ensure the receipt image is clear and the text is legible. Poor scans may fail OCR." },
  { q: "Can I track spending by categories?", a: "Yes, 'Spending Analytics' page displays total spendings by day and by item." },
  { q: "How do I delete a receipt?", a: "Go to 'Record Receipt', find the receipt you want to remove, and click the Remove button next to it." }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <div className="layout">
            <div className="sidebar">
                <h2 className="sidebar-title">Receipt Scanner</h2>
                <nav className="navigation-buttons">
                    <NavLink to="/home" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Home</NavLink>
                    <NavLink to="/ScannerOptions" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Record Receipt</NavLink>
                    <NavLink to="/SpendingAnalytics" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Spending Analytics</NavLink>
                    <NavLink to="/ShoppingListEditor" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Shopping List</NavLink>
                    <NavLink to="/Settings" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Settings</NavLink>
                    <NavLink to="/FAQ" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>FAQ</NavLink>
                </nav>
                <div className="signout-container">
                    <NavLink to="/Login" className="navigation-item signout-button">Sign Out</NavLink>
                </div>
            </div>

            <div className="content">
                <h1>Frequently Asked Questions</h1>
                {faqs.map((item, i) => (
                    <div key={i} className="faq-card">
                        <div className="faq-question" onClick={() => toggle(i)}>
                            {item.q}
                            <span className="faq-toggle">{openIndex === i ? "−" : "+"}</span>
                        </div>
                        {openIndex === i && <div className="faq-answer">{item.a}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
