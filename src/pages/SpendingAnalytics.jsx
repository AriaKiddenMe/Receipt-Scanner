import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/SpendingAnalytics.css";

const SpendingAnalytics = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="layout">
      <div className="sidebar">
        <h2 className="sidebar-title">Receipt Scanner</h2>
        <div className="navigation-links-container">
          <nav className="navigation-buttons">
            <Link to="/home" className="navigation-item">Home</Link>
            <Link to="/spending-analytics" className="navigation-item active">Spending Analytics</Link>
            <Link to="/price-comparison" className="navigation-item">Price Comparison</Link>
            <Link to="/settings" className="navigation-item">Settings</Link>
          </nav>
        </div>
      </div>
      <div className="content">
        <h1>Spending Analytics</h1>
        <div className="date-pickers">
          <label>
            From:{" "}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label style={{ marginLeft: "20px" }}>
            To:{" "}
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <button
            className="display-btn"
            onClick={() => console.log("Display clicked", fromDate, toDate)}
          >
            Display
          </button>
        </div>
        <div className="chart">
          <p>CHART WILL BE DISPLAYED HERE</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;