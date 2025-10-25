import {Link} from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios'
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
        <div
        align="center"> 
            <h1>Login Page</h1>
            <div>
                <form style={{display: 'inline-block', textAlign: 'left'}}>
                    <div>
                        <label
                            htmlFor="username">Username:
                        </label><br/>
                        <input
                            type="text"
                            value={username}
                            id = "username"
                            name="username"
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label
                        htmlFor="password">Password:
                        </label><br/>
                        <input
                            type={showPass? "text": "password"}
                            id="password"
                            value={password}
                            name="password"
                            autoComplete="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input type = "checkbox" 
                        onChange = {() => setShowPass(v => !v)}
                        style = {{marginLeft : 8}}/> -- Show Password
                    </div> <br/> 
                    <button
                        type="button" onClick={(event) => {
                        handleLogin(event, username, password)}}>
                        Submit
                    </button><br/>
                    <Link
                        to = "/Signup">
                        Signup
                    </Link>
                </form>
            </div>
        </div>
    );
};
export default Login; 