import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import SpendingAnalytics from './pages/SpendingAnalytics.jsx';
import ShoppingListEditor from './pages/ShoppingListEditor.jsx';
import ScannerOptions from './pages/ScannerOptions.jsx';
import PriceShop from './pages/PriceShop.jsx';
import Settings from './pages/Settings.jsx';
import FAQ from "./pages/FAQ";

import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route path="/Login" element={<Login />}></Route>
            <Route path="/Signup" element={<Signup />}></Route>
            <Route path="/Home" element={<Home />}></Route>
            <Route path="/SpendingAnalytics" element={<SpendingAnalytics />} />
            <Route path="/ShoppingListEditor" element={<ShoppingListEditor />}></Route>
            <Route path="/ScannerOptions" element={<ScannerOptions />} />
            <Route path="/PriceShop" element={<PriceShop />} />
            <Route path="/Settings" element={<Settings />}></Route>
            <Route path="/FAQ" element={<FAQ />} />
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
