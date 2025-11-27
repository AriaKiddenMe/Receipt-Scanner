import {React, useEffect} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/SpendingAnalytics.css";

const Home = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const user = localStorage.getItem('user');
  const navigate = useNavigate();
  useEffect(() => {
    console.log("user", user);
    if (!user) {
       navigate('/Login');
    }
  }, [user, navigate]);

  return (
    <div className="layout">
      <div className="sidebar">
        <h2 className="sidebar-title">Receipt Scanner</h2>
        <div className="navigation-links-container">
          <nav className="navigation-buttons">
            <NavLink to="/home" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Home</NavLink>
            <NavLink to="/ScannerOptions" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Record Receipt</NavLink>
            <NavLink to="/SpendingAnalytics" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Spending Analytics</NavLink>
            <NavLink to="/ShoppingListEditor" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Shopping List</NavLink>
            <NavLink to="/Settings" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>Settings</NavLink>
            <NavLink to="/FAQ" className={({ isActive }) => isActive ? "navigation-item active" : "navigation-item"}>FAQ</NavLink>
          </nav>
        </div>

        <div className="signout-container">
          <NavLink to="/Login" className="navigation-item signout-button">Sign Out</NavLink>
        </div>
      </div>

      <div className="content">
        <h1>Welcome to Receipt Scanner {user}</h1>
        <p>{formattedDate}</p>
      </div>
    </div>
  );
};

export default Home;
