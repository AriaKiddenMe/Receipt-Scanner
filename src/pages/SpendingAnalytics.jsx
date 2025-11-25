import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/SpendingAnalytics.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

const SpendingAnalytics = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartData, setChartData] = useState([]);

  const handleDisplay = async () => {
    if (!fromDate || !toDate) return;

    try {
      const response = await axios.get("http://localhost:9000/getSpendingByDay", {
        params: { fromDate, toDate }
      });

      const formattedData = response.data
        .map(entry => ({ date: entry.date, amount: Number(entry.amount) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching spending data:", error);
    }
  };

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
        </nav>
        <div className="signout-container">
          <NavLink to="/Login" className="navigation-item signout-button">Sign Out</NavLink>
        </div>
      </div>

      <div className="content">
        <h1>Spending Analytics</h1>

        <div className="date-pickers">
          <label>
            From:{" "}
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label style={{ marginLeft: "20px" }}>
            To:{" "}
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button className="display-btn" onClick={handleDisplay}>Display</button>
        </div>

        <div className="chart-container" style={{ width: "100%", height: 400 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No spending data to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;
