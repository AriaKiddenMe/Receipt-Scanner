// This is the backend part of the application that interacts with the Mongo Database,
// either by pulling in user information (through the signup page) to create a new user account and
// promptly stores that as a record in the database or pulls up stored user records from the database
// in which to compare provided user login credentials with (through the login page) to try and find a match. 

const {hashing, verifyHash} = require('./Helpers/Hash')
const express = require('express');
const cors = require('cors');
const app = express();
const User = require('./UserSchema')
app.use(express.json());
app.use(cors())
app.listen(9000, ()=> {
    console.log('Server Started at ${9000}')
})

const mongoose = require('mongoose');
const mongoString = "mongodb+srv://Kronos0117:Sharingan0117@icsi418y.iytsman.mongodb.net/ReceiptScanner"
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => console.log(error))

database.once('connected', () => console.log('Databased Connected'))

// Creates and stores new user accounts in the database while also checking if the provided 
// account to be created has a username that's already in use, if so, no account is created.
app.post('/createUser', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.f_name} ${req.body.l_name}`)
    const un = req.body.username
    const generatedHash = hashing(req.body.password)
    if (generatedHash == false) {
        res.status(200).send(false)
        return
    }
    try {
        //Check if username already exists in database
        User.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                const user = new User({f_name: req.body.f_name, l_name: req.body.l_name, username: req.body.username,
                passwordHash: generatedHash});
                user.save()
                console.log(`User created! ${user}`)
                res.send(true)
            }
            else {
                console.log("Username already exists")
                res.status(200).send("Username already exists")
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})

// Pulls up user records from the database to try and find a match from the provided user login credentials.
// If there is a match, it's a successful login and if not, then the user has provided the wrong credentials.
app.get('/getUser', async(req, res) => {
    console.log(`Verifying user login: ${req.query.username}`)
    const un = req.query.username
    const pass = req.query.password
    try {
        const user_result = await User.exists({username: un})
            if(user_result === null) {
                console.log(`User with username: ${un} does not exists`)
                res.status(200).send(false)
            }
            else {
                const holder =  await (User.findOne({username: un}, 'passwordHash -_id').lean())
                if(holder === null) {
                    console.log("Server error")
                    res.status(500).send("Server error")
                    return
                }
                const result = verifyHash(pass, holder.passwordHash)
                if (result) {
                    console.log("Login was a success")
                    res.status(200).send(true)
                }
                else {
                    console.log("Login failed - invalid credentials")
                    res.status(200).send(false)
                }

            }
    }
    catch (error){
        res.status(500).send(error)
    }
})

