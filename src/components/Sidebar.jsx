import { NavLink } from "react-router-dom";
import "../styles/SpendingAnalytics.css";

function Sidebar(){
  return(
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
  );
}export default Sidebar;