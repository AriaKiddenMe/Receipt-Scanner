import {Link, useNavigate} from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios'

import "../styles/Login.css"

//this page is used to create an account.
//theere is a link to login if the user wants to login

const Signup = () => {
    const[showPass, setShowPass] = useState(false);
    const [f_name, setFirstName] = useState('');
    const [l_name, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    //if account is created, then redirected to home page
    //if not, then a red text appears stating it
    const handleSignUp = (event, f_name, l_name, username, password) => {
        event.preventDefault()
        axios.post('http://localhost:9000/createUser', { f_name, l_name, username, password })
        .then((res) => {
            if(res.data === true) {
                document.querySelector('#error-msg').textContent = ""
                navigate('/Login')
            } else {
                document.querySelector('#error-msg').textContent = "Invalid Sign Up";
            }
        })
        .catch()
    }
    return (
        <div className="login-container">
            <div className="image-sidebar">
                <p>
                    Image sidebar goes here.
                </p>
            </div>
            <div className='main-content'>
                <div className="introduction">
                    <p>
                        Sign up to start saving
                    </p>
                </div>
                <div id='error-msg'></div>
                <div className='form'>
                    <form onSubmit={(event) => handleSignUp(event, f_name, l_name, username, password)}>
                        <div className='form-field'>
                            <label htmlFor="fname">First Name:</label> <br/>
                            <input
                            required
                            type="text"
                            value = {f_name}
                            id = "fname"
                            name="fname"
                            autoComplete="fname"
                            onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className='form-field'>
                            <label htmlFor="lname">Last Name:</label> <br/>
                            <input
                            required
                            type="text"
                            value = {l_name}
                            id = "lname"
                            name="lname"
                            autoComplete="lname"
                            onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className='form-field'>
                            <label htmlFor="username">Username:</label> <br/>
                            <input
                            required
                            type="text"
                            value = {username}
                            id = "username"
                            name="username"
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className='form-field'>
                            <label htmlFor="password">Password:</label> <br/>
                            <input
                            required
                            type={showPass? "text": "password"}
                            value = {password}
                            id="password"
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
                                    to = "/Login">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Signup;