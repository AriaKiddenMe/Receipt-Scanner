// This is the backend part of the application that interacts with the Mongo Database,
// either by pulling in user information (through the signup page) to create a new user account and
// promptly stores that as a record in the database or pulls up stored user records from the database
// in which to compare provided user login credentials with (through the login page) to try and find a match.
// either by creating and storing or retrieving user records and also by either creating and storing
// or retrieving receipt records. This also interacts with an Azure Resource: Document Intelligence Form Recognizer,
// to process scanned files via OCR reads which then returns the data to the front end for futher processing.

const axios = require('axios')
const contain_multer = require('multer');
const file_upload = contain_multer();
const {hashing, verifyHash} = require('./Helpers/Hash')
const express = require('express');
const cors = require('cors');
const app = express();

const User = require('./schemas/UserSchema');
const Receipt = require('./schemas/ReceiptSchema');
const ShoppingList = require('./schemas/ShoppingListSchema');

require('dotenv').config({path:'./.env'});
const AZURE_DI_ENDPOINT = process.env.AZURE_DI_ENDPOINT;
const AZURE_DI_KEY = process.env.AZURE_DI_KEY;
app.use(express.json());
app.use(cors())
app.listen(9000, ()=> {
    console.log('Server Started at ${9000}')
})

const mongoose = require('mongoose');
const mongoString = process.env.DB_KEY;
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => console.log(error))

database.once('connected', () => console.log('Database Connected'))

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

// Enables an uploaded file, a scanned copy of a receipt, to be read and processed by API calls
// to an Azure Resource: Document Intelligence Form Recognizer via OCR reads. This in turn extracts textual data from
// from the file and returns a structured format with that data, which will later be used to parse fields containing
// data needed to generate a receipt record.
app.post('/scanAzureAPI', file_upload.single("scannedReceipt"), async(req, res) => {
    if(!req.file) {
        return res.status(400).send("No file has been uploaded")
    }
    const file_container = req.file.buffer
    const url = AZURE_DI_ENDPOINT + "documentintelligence/documentModels/prebuilt-receipt:analyze?api-version=2024-11-30"
    let location
    try {
        const response = await axios.post(url, file_container,{
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_DI_KEY,
                "Content-Type": "application/octet-stream",
            },
        })
        if(response.status === 202) {
            location = response.headers["operation-location"]

        }
        else {
            return res.status(502).send("Server-side error")
        }
    }
    catch(error) {
        return res.status(500).send(error)
    }
    let result = null
    for(let i = 0; i < 30; i++) {
        let sol = await axios.get(location, {headers: {"Ocp-Apim-Subscription-Key": AZURE_DI_KEY}})
        let body = sol.data
        if(body.status === "succeeded") {
            result = body
            break
        }
        else if (body.status === "failed") {
            return res.status(502).send("Server-side error")
        }

        if(i < 29 ) {
            await new Promise(res => setTimeout(res, 1000))
        }
    }
    if (result === null) {
        return res.status(504).send("Timeout has occured")
    }
    let fields_container
    if (result?.analyzeResult) {
        if(result.analyzeResult?.documents && result.analyzeResult.documents.length > 0) {
            fields_container =  result.analyzeResult.documents[0].fields
        }
        else {
            return res.status(200).send({fields: null})
        }
    }
    else {
        if(result?.documents && result.documents.length > 0) {
            fields_container = result.documents[0].fields
        }
        else {
            return res.status(200).send({fields: null})
        }
    }
    return res.status(200).send({fields: fields_container})
})

// Generates a receipt record by first funneling data extracted from the fields retrieved from the Azure Resource.
// Then this data is stored into the appropriate fields of the receipt document. Once the field assignments
// is complete, the new receipt record is created and stored in the databse.
app.post('/generateReceiptRecord', async (req, res) => {
    try {
        const receipt_record = new Receipt({
            store_name: req.body.store_name,
            store_location: req.body.store_location,
            store_phone: req.body.store_phone,
            purchase_date: new Date(req.body.purchase_date),
            purchase_time: req.body.purchase_time,
            total_price: req.body.total_price,
            tax_rate: req.body.tax_rate,
            items: req.body.items,
            generated_by_user: req.body.generated_by_user,
        })
        await receipt_record.save()
        console.log(`Receipt Record created! ${receipt_record}`)
        res.status(200).send(true)
    }
    catch(error) {
        res.status(500).send(error)
    }
})

// Retrieves total spending aggregated by each day within a specified date range
// Filters receipts to only include those created by the logged-in user
app.get('/getSpendingByDay', async (req, res) => {
  try {
    const { fromDate, toDate, user } = req.query;
    if (!fromDate || !toDate || !user) return res.status(400).send("fromDate, toDate and user are required");

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const receipts = await Receipt.find({
      purchase_date: { $gte: from, $lte: to },
      generated_by_user: user
    }).lean();

    const spendingByDay = {};
    receipts.forEach(r => {
      const day = r.purchase_date.toISOString().split("T")[0];
      if (!spendingByDay[day]) spendingByDay[day] = 0;
      spendingByDay[day] += r.total_price;
    });

    const chartData = Object.entries(spendingByDay).map(([date, amount]) => ({ date, amount }));
    res.status(200).send(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


// Retrieves total spending aggregated by item within a specified date range
// Filters receipts to only include items from receipts generated by the logged-in user
app.get("/getSpendingByItem", async (req, res) => {
  try {
    const { fromDate, toDate, user } = req.query;
    if (!fromDate || !toDate || !user) return res.status(400).send("fromDate, toDate and user are required");

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const receipts = await Receipt.find({
      purchase_date: { $gte: from, $lte: to },
      generated_by_user: user
    }).lean();

    const itemTotals = {};
    receipts.forEach(r => {
      r.items.forEach(item => {
        const name = item.Item || "Unnamed Item";
        const total = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        itemTotals[name] = (itemTotals[name] || 0) + total;
      });
    });

    const result = Object.keys(itemTotals).map(name => ({
      item: name,
      amount: itemTotals[name]
    }));

    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


//get the currently logged in user using localStorage, and retrieve all of the items from the last week
app.get('/getThisWeeksItems', async (req, res) => {
    try {
        const username = req.query.user;
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate()-7);

        const receipts = await Receipt.find({
            purchase_date: { $gte: from, $lte: to },
            generated_by_user: username
        }).lean();

        let thisWeeksItems = [];
        receipts.forEach(r => {
            thisWeeksItems.push(r.items);
        });
        thisWeeksItems = thisWeeksItems.flat(Infinity);

        let spentThisWeek = 0;
        thisWeeksItems.forEach(i => {
            spentThisWeek += i.price;
        });
        console.log(thisWeeksItems);
        console.log("spent this week: " + spentThisWeek);

        res.status(200).send({thisWeeksItems, spentThisWeek});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});
