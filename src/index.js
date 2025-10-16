import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals'; 

import Login from './pages/Login.jsx';
import ShoppingListEditor from './pages/ShoppingListEditor.jsx';
import Settings from './pages/Settings.jsx';

import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import SettingsPage from './pages/Settings';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route path="/Login" element={<Login />}></Route>
            <Route path="/Settings" element={<SettingsPage />}></Route>
            <Route path="/ShoppingListEditor" element={<ShoppingListEditor />}></Route>
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
