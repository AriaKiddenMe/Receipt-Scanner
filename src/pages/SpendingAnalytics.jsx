import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
            <NavLink
              to="/home"
              className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}
            >
              Home
            </NavLink>
            <NavLink
              to="/ScannerOptions"
              className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}
            >
              Record Receipt
            </NavLink>
            <NavLink
              to="/SpendingAnalytics"
              className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}
            >
              Spending Analytics
            </NavLink>
            <NavLink
              to="/ShoppingListEditor"
              className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}
            >
              Shopping List
            </NavLink>
            <NavLink
              to="/Settings"
              className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}
            >
              Settings
            </NavLink>
          </nav>
        </div>
        <div className="signout-container">
          <Link to="/Login" className="navigation-item signout-button">Sign Out</Link>
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