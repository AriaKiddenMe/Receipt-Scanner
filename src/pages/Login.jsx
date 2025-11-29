import {Link, useNavigate} from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios'

import "../styles/Login.css"

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const[showPass, setShowPass] = useState(false);

    const navigate = useNavigate();

    localStorage.clear();

    const handleLogin = (event, username, password) => {
        event.preventDefault()
        axios.get('http://localhost:9000/getUser', { params: { username, password}})
            .then((res) => {
                if (res.data) {
                    localStorage.setItem('user', username);
                    navigate('/Home');
                } else {
                    document.querySelector('#error-msg').textContent = "Incorrect Login";
                }
            })
            .catch((err) => {
                console.log("error logging in");
            })
    }
    return (
        <div className="login-container">
            <div className="image-sidebar">
                <p>
                    Image sidebar goes here.
                </p>
            </div>
            <div className="main-content">
                <div className="introduction">
                    <p>
                        Login and start saving
                    </p>
                </div>
                <div id='error-msg'></div>
                <div className="form">
                    <form onSubmit={(event) => handleLogin(event, username, password)}>
                        <div className="form-field">
                            <label htmlFor="username">Username</label><br/>
                            <input
                            required
                            type="text"
                            value={username}
                            id = "username"
                            name="username"
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="password">Password:</label><br/>
                            <input
                            required
                            type={showPass? "text": "password"}
                            id="password"
                            value={password}
                            name="password"
                            autoComplete="password"
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='form-actions'>
                            <div className='form-action'>
                                <button
                                    className='submission-btn submit-btn'
                                    type="submit">
                                    Submit
                                </button><br/>
                            </div>
                            <div className='form-action'>
                                <Link
                                to = "/Signup">
                                Signup
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Login;