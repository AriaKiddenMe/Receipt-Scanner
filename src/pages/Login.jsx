import {Link} from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios'

import "../styles/Login.css"

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const[showPass, setShowPass] = useState(false);
    const handleLogin = (event, username, password) => {
    axios.get('http://localhost:9000/getUser', { params: { username, password}})
        .then((res) => {
            if (res.data) {
                alert('Login Successful')
            }
            else {
                alert('Wrong Credentials')
            }
        })
        .catch((err) => alert('Error in Login'))
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
                <div className="form">
                    <form>
                        <div className="form-field">
                            <label htmlFor="username">Username</label><br/>
                            <input
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
                            type={showPass? "text": "password"}
                            id="password"
                            value={password}
                            name="password"
                            autoComplete="password"
                            onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* <input type = "checkbox" 
                            className='checkbox'
                            onChange = {() => setShowPass(v => !v)}
                            style = {{marginLeft : 8}}/> */}
                        </div>
                        <div className="form-checkbox">

                        </div>
                        <div className='form-actions'>
                            <div className='form-action'>
                                <button
                                    className='submit-btn'
                                    type="button" onClick={(event) => {
                                    handleLogin(event, username, password)}}>
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