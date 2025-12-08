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
const url = require("url");
const app = express();
const {sys_favorite_stores, distance_unit_types, transport_types} = require('../src/constants');

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

// Get most recent receipt created
// Used to get recipt so that user can edit it as a shopping list
app.get('/getLatestReceiptForUser', async (req, res) => {
    try {
        const username = req.query.user;
        if (!username) {
            return res.status(400).send("user is required");
        }

        const latestReceipt = await Receipt.findOne({
            generated_by_user: username
        })
        .sort({ purchase_date: -1, generatedTime: -1 })
        .lean();

        if (!latestReceipt) {
            return res.status(404).send("No receipts found for this user");
        }

        res.status(200).send(latestReceipt);
    } catch (error) {
        console.error("Error in /getLatestReceiptForUser:", error);
        res.status(500).send("Server error");
    }
});

// Load Settings filters for user
app.get("/getUserFilterSettings", async (req, res) => {
  try {
    const username = req.query.user;
    if (!username) {
      return res.status(400).send("user is required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const sp = user.searchParameters || {};

    res.status(200).send({
      preferred_brands: sp.preferred_brands || [],
      banned_brands: sp.banned_brands || [],
      banned_allergens: sp.banned_allergens || [],
      privacy_flag: !!sp.privacy_flag,
    });
  } catch (err) {
    console.error("Error in /getUserFilterSettings", err);
    res.status(500).send("Server error");
  }
});

// Save Settings filters entered in settings tab for the user
app.post("/updateUserFilterSettings", async (req, res) => {
  try {
    const {
      user: username,
      preferred_brands,
      banned_brands,
      banned_allergens,
      privacy_flag,
    } = req.body;

    if (!username) {
      return res.status(400).send("user is required");
    }

    const toStringArray = (val) =>
      Array.isArray(val)
        ? val.map((v) => String(v).trim()).filter(Boolean)
        : [];

    const preferred = toStringArray(preferred_brands);
    const banned = toStringArray(banned_brands);
    const allergens = toStringArray(banned_allergens);
    const privacy = !!privacy_flag;

    const update = {
      "searchParameters.preferred_brands": preferred,
      "searchParameters.banned_brands": banned,
      "searchParameters.banned_allergens": allergens,
      "searchParameters.privacy_flag": privacy,
    };

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: update },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Error in /updateUserFilterSettings", err);
    res.status(500).send("Server error");
  }
});

//Gets settings for user
app.get("/getUserSettings", async (req, res) => {
  try {
    const username = req.query.user;
    if (!username) {
      return res.status(400).send("user is required");
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).send("User not found");
    }

    const sp = user.searchParameters || {};
    const preferredList = sp.preferred_brands || [];
    const bannedList = sp.banned_brands || [];
    const allergenList = sp.banned_allergens || [];
    const radius = typeof sp.default_distance === "number" ? sp.default_distance : 10;
    const privacyEnabled = !!sp.privacy_flag;

    res.status(200).send({
      preferredList,
      bannedList,
      allergenList,
      radius,
      privacyEnabled,
    });
  } catch (err) {
    console.error("Error in /getUserSettings", err);
    res.status(500).send("Server error");
  }
});

// Updates settings for user
app.post("/updateUserSettings", async (req, res) => {
  try {
    const {
      user: username,
      preferredList,
      bannedList,
      allergenList,
      radius,
      privacyEnabled,
    } = req.body;

    if (!username) {
      return res.status(400).send("user is required");
    }

    const toStringArray = (val) =>
      Array.isArray(val)
        ? val.map((v) => String(v).trim()).filter(Boolean)
        : [];

    const preferred = toStringArray(preferredList);
    const banned = toStringArray(bannedList);
    const allergens = toStringArray(allergenList);
    const r = typeof radius === "number" ? radius : 10;
    const privacy = !!privacyEnabled;

    const update = {
      "searchParameters.preferred_brands": preferred,
      "searchParameters.banned_brands": banned,
      "searchParameters.banned_allergens": allergens,
      "searchParameters.default_distance": r,
      "searchParameters.privacy_flag": privacy,
    };

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: update },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Error in /updateUserSettings", err);
    res.status(500).send("Server error");
  }
});

app.get('/getUserSearchPreferences', async (req, res) => {
    console.log("getting user search preferences")
    try{
        const usname = req.query.user;
        const user = await User.findOne({username: usname},);
        const searchParams = await user.searchParameters; //TODO what if searchParameters itself is empty
        let template = {
            def_dist: 20,
            def_dist_unit: "mi",
            def_max_stores: 0,
            def_transp: "straight line",
            def_prio_faves: true,
            fav_stores: [""]
        }
        if(searchParams){
            let def_dist = searchParams.default_distance || template.def_dist;
            let def_dist_unit = searchParams.default_distance_unit || template.def_dist_unit;
            let def_max_stores = searchParams.default_max_stores || template.def_max_stores;
            let def_transp = searchParams.default_transport || template.def_transp;
            let def_prio_favs = searchParams.default_prioritize_favorites || template.def_prio_faves;
            let fav_stores = searchParams.user_favorite_stores || template.fav_stores;
            res.status(200).send({
                def_dist: def_dist,
                def_dist_unit: def_dist_unit,
                def_max_stores: def_max_stores,
                def_transp: def_transp,
                def_prio_faves: def_prio_favs,
                fav_stores: fav_stores
            });
        } else {res.status(200).send({template})};
    } catch(error){
        console.error(error,"\n\n");
        res.status(500).send(("Server Error in requesting User Search Preferences"+"\n\n"));
    }
})

async function processPriceSearchInput(parsedEntries){
    let usname, shoppingListName, distance,
    distanceUnit, transport, priorFaves, maxStores, maxPriceAge,
    favorite_store_strings, fav_stores_length
    let arrayName="favorite_stores"
    let arrayNameLen = arrayName.length
    let errorMsg = (unknownName, value) => {("input parameter unaccounted for {name: ", unknownName, "; value: ", value,"}")}
    for(let i = 0; i < parsedEntries.length; i++){
        let row = parsedEntries[i]
        switch (row[0]) {
            case "username":
                usname = row[1]
                break;
            case "shoppingList":
                shoppingListName = row[1]
                break;
            case "distance":
                distance = parseInt(row[1])
                break;
            case "distance_unit":
                distanceUnit = row[1]
                break;
            case "transport":
                transport = row[1]
                break;
            case "prior_faves":
                priorFaves = (row[1]=="true")
                break;
            case "max_price_age":
                maxStores = parseInt(row[1])
                break;
            case "max_stores":
                maxPriceAge = parseInt(row[1])
                break;
            case "fav_stores_length":
                fav_stores_length = (parseInt(row[1])>0)? parseInt(row[1]) : 1
                favorite_store_strings = Array.from(('?').repeat(fav_stores_length));
                break;
            default:
                if(row[0].length>= arrayNameLen && row[0].substring(0,arrayNameLen)===arrayName){
                    let indexNamePieces = (row[0].replaceAll("]","[").split("["))
                    if(Number.parseInt(indexNamePieces[3])===NaN) {
                        throw errorMsg(row[0],row[1])
                    }
                    let indexWithinArray = Number.parseInt(indexNamePieces[3]);

                    if(typeof favorite_store_strings==="undefined") {
                        if(parsedEntries.findIndex((val)=>(val.length>=arrayNameLength&&val.substring(0,arrayNameLength)===arrayName))!==-1){
                            //there are entries, we are just waiting for the thread processing fav_stores_length
                            while(typeof favorite_stores==="undefined"){await sleep(200)}
                        }
                    } else if(indexWithinArray < fav_stores_length){ //don't surpass the original passed array's length
                            favorite_store_strings[indexWithinArray] = row[1];
                    } else {
                        console.log("are we here, ROW", row, indexWithinArray)
                        throw (errorMsg(row[0],row[1]))
                    }
                }
                break;
            }
    }
    let favorite_stores = favorite_store_strings.map((val)=>{
        let store_name = val.substring(0, val.indexOf('['))
        let store_location = val.substring(val.indexOf('[')+1, val.indexOf(']'))
        return [store_name, store_location]
    })
    return {usname, shoppingListName, distance,
    distanceUnit, transport, priorFaves, maxStores, maxPriceAge,
    favorite_stores}
}

async function getAvailReceipts(usr, maxPriceAge){
    //NOTE: this would be bad practive for a scaling application, but for our purposes
    //I am requesting all available receipts that the user has access to.
    let todayDate = new Date();
    let oldestDate = (maxPriceAge!=0) ? new Date((todayDate.valueOf() - 1000*60*60*24*maxPriceAge)) : new Date("Jan 1, 1910");

    const usersReceipts = await Receipt.find({
        purchase_date: { $gte: oldestDate, $lte: todayDate },
        generated_by_user: usr.username
    })
    const publicReceipts = await Receipt.find({
        purchase_date: { $gte: oldestDate, $lte: todayDate },
        public: true
    })
    console.log("Receipts available: ", usersReceipts.length + publicReceipts.length);

    //updating the accessibility (isPublic) property for each of the urer's receipts that needs it
    // usersReceipts.foreach((receipt) => {
    //     if(receipt.public != (usr.receipts_public)){
    //         let newValue = !(usr.receipts_public)
    //         //updating the publicity / privacy of user's receipts
    //         database.collection('Receipts').updateOne(
    //             {_id: receipt._id}, {$set: {public: (newValue)}}
    //         )
    //     }
    // })
    return usersReceipts.concat(publicReceipts)
}

async function getAvailLocations(receipts){
    let returningArray = new Array();
    for(let i = 0; i < receipts.length; i++){
        let loc = [receipts[i].store_name, receipts[i].store_location]
        if(returningArray.length==0){
            returningArray.push(loc);
        }
        for(let j = 0; j < returningArray.length; j++){
            let existingEntry = returningArray[j]
            if(!(existingEntry[0]===loc[0]&&existingEntry[1]===loc[1])){
                returningArray.push(loc);
            }
        }
    }
    return returningArray
}

async function insertFavorites(availLocations, fav_stores){
    //finding which favorites are in the database
    let ordermap = new Int32Array(availLocations.length)
    let foundFaves = new Int32Array(fav_stores.length)

    for(let i = 0; i < fav_stores.length; i++){
        console.log("i=",i)
        let currentFav = fav_stores[i]
        for(j=0;j<availLocations.length; j++){
            console.log("j=",j)
            potFav = availLocations[j]
            if(potFav[0]===currentFav[0]&&potFav[1]===currentFav[1]){
                ordermap[j]=i+1
                foundFaves[i] = true;
                console.log("found a fav")
                break;
            }
        }
    }
    console.log("favorites map:", ordermap," for ", availLocations)
    console.log("missing-favorites map:", foundFaves," for ", fav_stores)

    let favLocations = []
    let otherLocations = []
    return [favLocations, otherLocations]
}

app.get('/priceSearch', async (req, res) => {
    console.log("attempting a price search, given: ")
    try{
        let parsedUrl = url.parse(req.url, true);
        const parsedEntries = Object.entries(parsedUrl.query);
        console.log(parsedEntries)

        let {usname, shoppingListName, distance, distanceUnit,
            transport, priorFaves, maxStores, maxPriceAge,
            favorite_stores} = await processPriceSearchInput(parsedEntries)
        console.log("usname:", usname, "\nshoppingList:", shoppingListName,
            "\ndistance:", distance, "\ndistanceUnit:", distanceUnit,
            "\ntransport:", transport, "\npriorFaves:", priorFaves,
            "\nmaxPriceAge:", maxPriceAge, "\nmaxStores:", maxStores,
            "\nfavorite_stores:", favorite_stores,"\n\n\n");

        //we have processed the input from the user out of the given object
        //CHECKS: verifying input is within expecations
        if((shoppingListName==="<no lists available>")){ throw ("Server not passed a list")}
        if(!distance_unit_types.includes(distanceUnit) || !transport_types.includes(transport)) {throw("cannot calculate with unknown distance values: "+distanceUnit+", "+transport)}
        if(distanceUnit===distance_unit_types[0] && transport===transport_types[0]){throw("cannot calculate linear distance in minutes")}
        if(typeof priorFaves !== "boolean") {throw "Prioritize favorites must be either \'true\' or \'false\'"}
        if(!Number.isInteger(maxPriceAge) || maxPriceAge<0) {throw("price-age-limit must be a number greater than or equal to 0 (0 indicates no limit). Value: "+maxPriceAge)}
        if(!Number.isInteger(maxStores) || maxStores<1) {throw("max stores must be a whole number greater than 0. Value: "+maxPriceAge)}

        let shopByDistance= !(distance > 0)
        let haveFavorites= Array.isArray(favorite_stores)&&favorite_stores.length>=1&&(!(favorite_stores.length==1 && favorite_stores[0]==="<no favorites given>"))
        if(shopByDistance && !haveFavorites) {throw "a search requires a distance and/or a favorite stores list"}

        //GET USER
        const usr = await User.findOne({
            username: usname
        }).lean()
        //if(usrList===null){throw "could not find user " + usname + " for PriceSearch"}
        //if(usrList.length > 1){throw "more than one user found with the username: "+usname}
        //const usr = usrList;//[0];
        console.log("user: ", usr.username)

        //GET SHOPPING-LIST
//        let listArr = await ShoppingList.find({
        const list = await ShoppingList.find({
            owner_id: usr._id,
            list_name: shoppingListName,
        })
        if(list===null){throw "could not find given shopping list " + usname + " for user " + usname + " during PriceSearch"}
        // if(listArr===null){throw "could not find given shopping list " + usname + " for user " + usname + " during PriceSearch"}
        //if((listArr).isArray&&listArr.length > 1){throw "more than one list \""+list_name+"\" found for the user "+usname + " during PriceSearch"}
        // const list = listArr[0];
        console.log("ShoppingList: ", list)
        console.log("\titemOne: ", list.listItems)

        //GET RECEIPTS
        const avail_receipts = await getAvailReceipts(usr, maxPriceAge)
        if(avail_receipts.length==0){ throw "there are no receipts available to this user"}

        //GET ALL AVAILABLE LOCATIONS
        const available_locations = await getAvailLocations(avail_receipts)
        console.log("available_locations: ", available_locations)

        //INSERT FAVORITES
        let [locationsToSearch, otherLocations] = (haveFavorites) ? await insertFavorites(available_locations, favorite_stores) : [[],available_locations]
        console.log("locationsToSearch: ", locationsToSearch, " otherLocations: ", otherLocations)

        //now we need to:
            //request all viable stores based off of available receipt database entries
            //reduce stores considered using the google maps API as well as the favorite_stores to find viable stores.
            //  starting with the favorites (if prior_faves) and then continuing (up to maxStores)
            //return a grid with stores as columns and entries as rows
        //res.status(200);
    } catch(error){
        console.error(error,"\n\n");
        res.status(500).send(("Server Error in requesting User Search Preferences"+"\n\n"));
    }
})

app.get('/getShoppingLists', async (req,res) =>{
    console.log("getting user's shopping lists")
    try{
        const usname = req.query.user;
        const user = await User.findOne({username: usname},);
        let usrID = user._id
        let shoppingLists = await ShoppingList.find({
            owner_id: usrID
        })
        const shoppingListNames = shoppingLists.map((val)=> {return val.list_name})
        res.status(200).send(shoppingListNames)
    } catch {
        console.error(error,"\n\n");
        res.status(500).send(("Server Error in requesting User Search Preferences"+"\n\n"));
    }
})

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
            spentThisWeek += (i.price * i.quantity);
        });
        console.log(thisWeeksItems);
        console.log("spent this week: " + spentThisWeek);

        res.status(200).send({thisWeeksItems, spentThisWeek});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});
