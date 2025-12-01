import {React, useEffect, useState} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from 'axios'
import Sidebar from '../components/Sidebar';

import "../styles/SpendingAnalytics.css";
import "../styles/Home.css"

//this is the landing page after login. From here, users can navigate to other pages using the navbar
//on the left-hand side. They can also see their purchases from the last week.

const Home = () => {
  const [amountSpent, setAmountSpent] = useState(0);
  const [items, setItems] = useState([]);
  const user = localStorage.getItem('user');

  //get current date to display 
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //set current amount spend taken from aggregated in /getThisWeeksItems
  //and get this weeks items to display in table
  const getThisWeeksItems = async () => {
    try {
    const res = await axios.get("http://localhost:9000/getThisWeeksItems", {
        params: {user}
      });
    setAmountSpent(res.data.spentThisWeek);
    setItems(res.data.thisWeeksItems);
    } catch(err) {
      console.error(err);
    }
  }

  //get current user state to display week's items and basic spending analytics
  const navigate = useNavigate();
  useEffect(() => {
    console.log("user", user);
    if (!user) {
       navigate('/Login');
       return;
    }
    getThisWeeksItems();
  }, [user, navigate]);

  return (
    <div className="layout">
      <Sidebar/>

      <div className="content">
        <h1>Welcome to Receipt Scanner {user}</h1>
        <p>{formattedDate}</p>
        <p>You spent ${amountSpent.toFixed(2)} this week.</p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Spent</th>
              </tr>
            </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.Item}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.quantity*item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default Home;
