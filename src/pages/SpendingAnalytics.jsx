import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/SpendingAnalytics.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from "recharts";
import axios from "axios";

const SpendingAnalytics = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartDataByDay, setChartDataByDay] = useState([]);
  const [chartDataByItem, setChartDataByItem] = useState([]);

  const handleDisplayByDay = async () => {
    if (!fromDate || !toDate) return;

    try {
      const response = await axios.get("http://localhost:9000/getSpendingByDay", {
        params: { fromDate, toDate }
      });
      const formattedData = response.data
        .map(entry => ({ date: entry.date, amount: Number(entry.amount) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setChartDataByDay(formattedData);
    } catch (error) {
      console.error("Error fetching spending data by day:", error);
    }
  };

  const handleDisplayByItem = async () => {
    if (!fromDate || !toDate) return;

    try {
      const response = await axios.get("http://localhost:9000/getSpendingByItem", {
        params: { fromDate, toDate }
      });
      const formattedData = response.data.map(entry => ({
        item: entry.item,
        amount: Number(entry.amount)
      }));
      setChartDataByItem(formattedData);
    } catch (error) {
      console.error("Error fetching spending data by item:", error);
    }
  };

  const handleDisplay = () => {
    handleDisplayByDay();
    handleDisplayByItem();
  };

  const noDataAvailable = chartDataByDay.length === 0 && chartDataByItem.length === 0;

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

        {noDataAvailable ? (
          <p>No spending data available for the selected date range.</p>
        ) : (
          <>
            <div className="chart-container" style={{ width: "100%", height: 400, marginBottom: 50 }}>
              <h3 style={{ textAlign: "center", marginBottom: 10 }}>Total Spendings by Day</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container" style={{ width: "100%", height: 400 }}>
              <h3 style={{ textAlign: "center", marginBottom: 10 }}>Total Spendings by Item</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByItem} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpendingAnalytics;
