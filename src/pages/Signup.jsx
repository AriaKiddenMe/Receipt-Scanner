import {Link} from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios'

import "../styles/Login.css"

const Signup = () => {
    const[showPass, setShowPass] = useState(false);
    const [f_name, setFirstName] = useState('');
    const [l_name, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSignUp = (event, f_name, l_name, username, password) => {
    axios.post('http://localhost:9000/createUser', { f_name, l_name, username, password })
    .then((res) => {
        if(res.data === true) {
            alert('Account successfully created!')
        }
        else if(res.data === 'Username already exists')
            alert('Username already exists')
        else {
            alert('Signup failed. Please try again')
        }
    })
        .catch((err) => alert('Error in Signing Up'))
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
                <div className='form'>
                    <form>
                        <div className='form-field'>
                            <label htmlFor="fname">First Name:</label> <br/>
                            <input
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
                                    className='submit-btn'
                                    type="button" onClick={(event) => handleSignUp(event, f_name, l_name, username, password)}>
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