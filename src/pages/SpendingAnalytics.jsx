import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/SpendingAnalytics.css";

const SpendingAnalytics = () => {
  // State to store the selected date range
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State to hold chart data for spendings by day and by item
  const [chartDataByDay, setChartDataByDay] = useState([]);
  const [chartDataByItem, setChartDataByItem] = useState([]);

  // Get the currently logged-in user's username from localStorage
  const user = localStorage.getItem("user");

  // Fetch spending data aggregated by day for the selected date range
  const handleDisplayByDay = async () => {
    if (!fromDate || !toDate) return;

    try {
      const response = await axios.get("http://localhost:9000/getSpendingByDay", {
        params: { fromDate, toDate, user }  // Pass the logged-in user to filter results
      });

      // Format the data and sort by date
      const formattedData = response.data
        .map(entry => ({ date: entry.date, amount: Number(entry.amount) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setChartDataByDay(formattedData);
    } catch (error) {
      console.error("Error fetching spending data by day:", error);
    }
  };

  // Fetch spending data aggregated by item for the selected date range
  const handleDisplayByItem = async () => {
    if (!fromDate || !toDate) return;

    try {
      const response = await axios.get("http://localhost:9000/getSpendingByItem", {
        params: { fromDate, toDate, user }  // Pass the logged-in user to filter results
      });

      // Format the data for the item chart
      const formattedData = response.data.map(entry => ({
        item: entry.item,
        amount: Number(entry.amount)
      }));

      setChartDataByItem(formattedData);
    } catch (error) {
      console.error("Error fetching spending data by item:", error);
    }
  };

  // Run both data fetches when the user clicks "Display"
  const handleDisplay = () => {
    handleDisplayByDay();
    handleDisplayByItem();
  };

  // Check if there is no data to show in the charts
  const noDataAvailable = chartDataByDay.length === 0 && chartDataByItem.length === 0;

  return (
    <div className="layout">
      <Sidebar/>
      <div className="content">
        <h1>Spending Analytics</h1>

        {/*Date selection inputs*/} 
        <div className="date-pickers">
          <label>
            From:{" "}
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label style={{ marginLeft: "20px" }}>
            To:{" "}
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button className="submission-btn display-btn" onClick={handleDisplay}>Display</button>
        </div>

        {/* Display message if no data is available */}
        {noDataAvailable ? (
          <p>No spending data available for the selected date range.</p>
        ) : (
          <>
            {/* Bar chart showing total spendings by day  */}
            <div className="chart-container" style={{ width: "100%", height: 400, marginBottom: 50 }}>
              <h3 style={{ textAlign: "center", marginBottom: 10 }}>Total Spendings by Day</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#8884d8ff" /> 
                </BarChart>
              </ResponsiveContainer>
            </div>

             {/* Bar chart showing total spendings by item */}
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
