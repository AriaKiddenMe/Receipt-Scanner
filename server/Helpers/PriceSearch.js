//I'm not familiar enough with mongoDB to know which will filter out the unset values
const {con} = require('../../src/constants.js')

require('dotenv').config({path:'../.env'});
const axios = require('axios')
const googleMapsIsAvailable = false;
const geoapifyIsAvailable = true;
// TODO: UNDO const GEOAPIFY_ENDPOINT = process.env.GEOAPIFY_ENDPOINT;
let GEOAPIFY_ENDPOINT ="https://api.geoapify.com/v1/routematrix?apiKey="
// TODO: UNDO const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;
let GEOAPIFY_KEY ="b48a8d4816bd4b5492719fdc1ece180a";


//schemas
const User = require('../schemas/UserSchema.js');
const Receipt = require('../schemas/ReceiptSchema.js');
const ShoppingList = require('../schemas/ShoppingListSchema.js');

const locMissingGeoLocation = (val) => {(val==null)||(val.store_geolocation==null)
    ||(val.store_geolocation.lon==null)||(val.store_geolocation.lat==null)
    ||(val.store_geolocation.lon==con.lat_lon_defaults)||(val.store_geolocation.lat==con.lat_lon_defaults)}
const simplifyStr = (str) => {
    return ((((((((""+str).toLowerCase()).replaceAll(
        ",","")).replaceAll(".","")).replaceAll(
            " ","")).replaceAll("\n","")).trim()))
}
const compareLoc_NameLatLon = (locOne, locTwo) => {
    return (simplifyStr(locOne[0])===simplifyStr(locTwo[0])&&locOne[2]===locTwo[2]&&locOne[3]===locTwo[3])
}
const compareLoc_NameString = (locOne,locTwo) => {
    return (simplifyStr(locOne[0])===simplifyStr(locTwo[0])&&simplifyStr(locOne[1])===simplifyStr(locTwo[1]))
}
const companreLocationsByDistance = (locOne, locTwo) => {return locOne[4] - locTwo[4]}
const recLoc = (rec) => (locMissingGeoLocation(rec) ?
[rec.store_name, rec.store_location]
: [rec.store_name, rec.store_location, rec.store_geolocation.lon, rec.store_geolocation.lat])
const earthRadiusMi = 3963; //miles
const MiPerKm = 1/1.60934;
const kmPerMi = 1.60934;

async function processPriceSearchInput(entriesToParse){
    let complicatedEntries = new Array() //values not processed in processBasicInputValues
    try {
        const retObj = await processBasicInputValues(entriesToParse, complicatedEntries)
        const notDecoded = new Array() //holds entries not decoded by either processBasicInputValues or unEncodeArray
        retObj.favorite_stores = await unEncodeArray(complicatedEntries, "favorite_stores", retObj.fav_stores_length, notDecoded)
        delete retObj.fav_stores_length
        if(notDecoded.length > 0){
            const errorMsg = (unknownName, value) => {return ("{name: ", unknownName, "; value: ", value,"}")}
            let errorString = "The following input parameters were unaccounted for:\n"
            for(item in notDecoded){
                errorString.append(errorMsg(item[0], item[1])+"\n")
            }
            throw errorString
        } else {
            return retObj
        }
    } catch(error) {
        throw "trouble parsing input: " + error
    }
}

async function processBasicInputValues(inputValues, unparsed){
    // for(let i = 0; i < parsedEntries.length; i++){
    try {
        let retObj = {}
        inputValues.forEach((row)=>{
            switch (row[0]) {
                case "username":{
                    retObj.usname = row[1]
                    break;
                }
                case "shoppingList":{
                    retObj.shoppingListName = row[1]
                    break;
                }
                case "currentLocation":{
                    retObj.currentLocation = row[1]
                    break;
                }
                case "distance":{
                    retObj.distance = parseInt(row[1])
                    break;
                }
                case "distance_unit":{
                    retObj.distanceUnit = row[1]
                    break;
                }
                case "transport":{
                    retObj.transport = row[1]
                    break;
                }
                case "prior_faves":{
                    retObj.priorFaves = (row[1]=="true")
                    break;
                }
                case "max_price_age":{
                    retObj.maxPriceAge = parseInt(row[1])
                    break;
                }
                case "max_stores":{
                    retObj.maxStores = parseInt(row[1])
                    break;
                }
                case "fav_stores_length":{
                    retObj.fav_stores_length = parseInt(row[1])
                    break;
                }
                default :{
                    unparsed.push(row)
                    break;
                }
            }
        })
        return retObj
    } catch (err) {
        throw "could not parse basic input values" + err
    }
}

async function unEncodeArray(entries, arrayName,origArrayLength, notDecodedValues){
    const retArray = new Array(origArrayLength)

    entries.forEach((row) => {
        const indexNamePieces = (row[0].replaceAll("]","[").split("["))

        if(row[0].length >= arrayName.length && row[0].substring(0,arrayName.length)===arrayName
        &&Number.parseInt(indexNamePieces[3])!==NaN){
            const indexWithinOrigArray = Number.parseInt(indexNamePieces[3]);
            if(indexWithinOrigArray < origArrayLength){
                let rowValPieces = (row[1].replaceAll("]","[").split("["))
                if(rowValPieces.length == 3){
                    retArray[indexWithinOrigArray] =[
                        rowValPieces[0],
                        rowValPieces[1]]
                }
            } else {
                throw "input for " + arrayName + " array has a value at an index outside the expected arrayLength given"
            }
        } else {
            notDecodedValues.push(row)
        }
    })
    return retArray
}

async function getAvailReceipts(usr, maxPriceAge){
    //NOTE: this would be bad practive for a scaling application, but for our purposes
    //I am requesting all available receipts that the user has access to.
    let todayDate = new Date();
    let oldestDate = (maxPriceAge!=0) ? new Date((todayDate.valueOf() - 1000*60*60*24*maxPriceAge)) : new Date("Jan 1, 1910");

    const usersReceipts = await Receipt.find({
        purchase_date: { $gte: oldestDate, $lte: todayDate },
        generated_by_user: usr.username,
        store_name: {$ne: ""},
        store_location: {$ne: ""}
        //$or: [  {public: {$exists: false}},  {public: false}  ]
    })
    const publicReceipts = await Receipt.find({
        purchase_date: { $gte: oldestDate, $lte: todayDate },
        store_name: {$ne: ""},
        store_location: {$ne: ""},
        public: true
        // $or: [  {public: {$exists: false}},  {public: true}  ]
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

function getAvailLocations(receipts){
    let returningArray = new Array();
    for(let i = 0; i < receipts.length; i++){
        let loc
        let locGeoBool = locMissingGeoLocation(receipts[i])
        if(locGeoBool){
            loc = [receipts[i].store_name, receipts[i].store_location]
        } else {
            loc = [receipts[i].store_name, receipts[i].store_location,
            receipts[i].store_geolocation.lon, receipts[i].store_geolocation.lat]
        }
        if(returningArray.length==0){
            returningArray.push(loc);
        } else {
            let alreadyAdded = false
            for(let j = 0; j < returningArray.length; j++){
                let existingEntry = returningArray[j]
                if(loc.length==4&&existingEntry.length==4){
                    if(compareLoc_NameLatLon(loc, existingEntry)){
                        alreadyAdded = true
                    }
                } else {
                    if(compareLoc_NameString(loc, existingEntry)){
                        alreadyAdded = true
                    }
                }
            }
            if(!alreadyAdded){
                returningArray.push(loc);
            }
        }
    }
    return returningArray
}

function insertFavorites(availLocations, fav_stores, maxStores){
    if(fav_stores.length == 0) return [[], availLocations]
    //finding which favorites are in the database
    let ordermapAvailLocations = new Int32Array(availLocations.length)
    let foundFavesMapFavStores = new Int32Array(fav_stores.length)
    //creating a map of the locations of the favorites, by order, and noting which favorites are not found
    for(let i = 0; (i < fav_stores.length && i < maxStores); i++){
        let currentFav = fav_stores[i]
        for(j=0;j<availLocations.length; j++){
            potFav = availLocations[j]
            if(potFav[0]===currentFav[0]&&potFav[1]===currentFav[1]){
                ordermapAvailLocations[j]=i+1
                foundFavesMapFavStores[i]++;
                break;
            }
        }
    }
    let favLocations = new Array()
    let otherLocations = new Array()
    let missingFavorites = new Array()
    for(let f = 0; (f < foundFavesMapFavStores.length && f < maxStores) ; f++){
        if(foundFavesMapFavStores[f]==0){
            missingFavorites.push(fav_stores[f])
        } else //when 1, we found it once, which is ideal
        if(foundFavesMapFavStores[f]==2){
            throw "availLocations contains non-unique values"
        }
    }
    for(let a = 0; a < ordermapAvailLocations.length; a++){
        if(ordermapAvailLocations[a]==0){
            //regular unassigned location
            otherLocations.push(availLocations[a])
        } else if(ordermapAvailLocations[a] > 0){
            favLocations[ordermapAvailLocations[a]-1] = availLocations[a]
        } else {
            console.log ("somehow the index of the typedArray is not 0 or a number greater")
            throw "somehow the index of the typedArray is not 0 or a number greater"
        }
    }

    return [favLocations, otherLocations, missingFavorites]
}

async function filterLocationsByDistance(locations, maxLocations, currentLocation, distance, distanceUnit, transport){

    console.log("init locs to filter: ", locations.map((loc)=>{return loc[0]}))
    // Needs to return a tuple
    if(locations.length <= 0 || maxLocations <= 0) return [[], []];
    //verifying input
    if(distance <= 0 || !con.distance_unit_types.includes(distanceUnit) || !con.transport_types.includes(transport))
        {throw "invalid input to filter Locations By Distance"}
    let needsDatabaseUpdating = new Array()
    console.log("initial array ", needsDatabaseUpdating)
    for (loc in locations){
        if(locMissingGeoLocation(locations[loc])){
            results = await getGeoCode(locations[loc][0],locations[loc][1])
            locations[loc][2] = results[0]
            locations[loc][3] = results[1]
            needsDatabaseUpdating.push(await locations[loc])
        }
    }

    if(needsDatabaseUpdating.length > 0){
        console.log("count: ", needsDatabaseUpdating.length, "needsDatabaseUpdating: ", needsDatabaseUpdating.map((loc)=>{return loc[0]}))
    }
    console.log("locations now being filtered by crow: ", locations.map((loc)=>{return loc[0]}))

    let currLoc = await getGeoCode(currentLocation[0], currentLocation[1])
    console.log("currentLoc lat and lon", currLoc)
    /*evaluates locations such that they all contain lon lat values, and
    filters out distances longer than the max distance as the crow flies*/
    let locsInRangeByCrow = await filterByCrowDistances(locations, currLoc, distance, distanceUnit, transport)

    const locationsQuantified = ((geoapifyIsAvailable) ? (await calculateDistByTripMatrixWGeoapify(currLoc, locsInRangeByCrow, distance, distanceUnit, transport)) : (googleMapsIsAvailable) ?  await calculateDistByTripMatrixWGoogleMaps(currLoc, locsInRangeByCrow, distance, distanceUnit, transport): new Array(5))

    console.log("locs within dist: ", await locationsQuantified);

    if(locationsQuantified === new Array(5)) {
        console.log(locationsQuantified, needsDatabaseUpdating)
        // return [locationsQuantified, needsDatabaseUpdating]
        return locationsQuantified
    }

    return locationsQuantified

    // //sort
    // locationsQuantified.sort(compareLocationsByDistance(locA,locB))
    // //shrink to maxLocations
    // if(locationsQuantified.length > maxLocations){
    //     locationsQuantified.length = maxLocations
    // }

    // console.log("sorted locs with dist: ", locationsQuantified.map((loc)=>{return loc[0]}));

    // for(let i = locationsQuantified.length-1; i >= 0 && locationsQuantified[i][4]>=distance; i--){
    //     locationsQuantified.pop()
    // }

    // //now filter out those too large
    // return [locationsQuantified, needsDatabaseUpdating];
}

const distTwoLonLatPtsMiles = (lonOne, latOne, lonTwo, latTwo) => {
    let latOneRad = latOne * Math.PI/180;
    let latTwoRad = latTwo * Math.PI/180;
    let latDiff = (latTwo-latOne) * Math.PI/180;
    let lonDiff = (lonTwo-lonOne) * Math.PI/180;
    let a = Math.sin(latDiff/2) * Math.sin(lonDiff/2) +
    Math.cos(latOne) * Math.cos(latTwo) * Math.sin(lonDiff/2) * Math.sin(lonDiff/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadiusMi * c; // in miles
}

async function filterByCrowDistances(locations,
    currLocLonLat, maxDistance, distanceUnit, transport){
    //first, get geospatial locations for all locations missing them (and update their associated db entries)

    //following that, we can compage all of them locally to rule out locations
    //that are too far as the crow flies
    let feasLocsByCrow = new Array()
    await locations.forEach((loc) => {
        let miBtByCrow = distTwoLonLatPtsMiles(currLocLonLat[0], currLocLonLat[1], loc[2], loc[3])
        console.log("loc: ",loc[0],", diffLon", currLocLonLat[0] - loc[2]," diffLat",currLocLonLat[1] - loc[3], "\ndistance: ", distTwoLonLatPtsMiles(currLocLonLat[0], currLocLonLat[1], loc[2], loc[3]))
        if(distanceUnit==con.distance_unit_types[0]){//distance given in minutes
            console.log("loc: ",loc[0], " given in minutes")
            switch(transport){
                case con.transport_types[0]: { //straight-line
                    console.log("loc: ",loc[0], " str_ln")
                    throw "cannot measure distance in minutes along a straight line"}
                    break;
                    case con.transport_types[1]: {//driving
                        console.log("loc: ",loc[0], " here")
                        //we will assume 70 miles an hour
                        if(miBtByCrow < maxDistance*(70/60)){
                        feasLocsByCrow.push(loc)
                    }
                    break;
                }
                case con.transport_types[2]: {//walking
                    console.log("loc: ",loc[0], " walk")
                    //we will assume 6 miles an hour
                    if(miBtByCrow < maxDistance*(6/60)){
                        feasLocsByCrow.push(loc)
                    }
                    break;
                }
                case con.transport_types[3]: {//biking
                    console.log("loc: ",loc[0], " bike")
                    //we will assume 15 miles an hour
                    if(miBtByCrow < maxDistance*(15/60)){
                        feasLocsByCrow.push(loc)
                    }
                    break;
                }
                case con.transport_types[4]: {//public transit
                    console.log("loc: ",loc[0], " pubTr")
                    //we will assume 30 miles an hour
                    if(miBtByCrow < maxDistance*(30/60)){
                        feasLocsByCrow.push(loc)
                    }
                    break;
                }
            }
        } else if(distanceUnit==con.distance_unit_types[1] || distanceUnit==con.distance_unit_types[2]){
            console.log("loc: ",loc[0], "km/mi")
            if(miBtByCrow < maxDistance * ((distanceUnit==con.distance_unit_types[2]) ? MiPerKm : 1.0)){
                feasLocsByCrow.push(loc)
            }
        } else throw "should never be of this data type"
    })
    console.log("feasLocsByCrow", feasLocsByCrow)
    return  feasLocsByCrow
}

async function getGeoCode(locationName, locationString){
    //temporary
    let currLocLonLat = [-73.72208965665413, 42.700251300000005];
    let [lon, lat] = currLocLonLat;
    return [lon,lat]
}

function calculateDistByTripMatrixWGeoapify(currLoc, destLocs, distance, distanceUnit, transport){
    console.log("destLocs", destLocs)
    let retVal
    //if(transport == con.transport_types[0]){ //straight line (by the crow)
        retVal = destLocs.forEach((dest)=>{
            dest[4] = (distTwoLonLatPtsMiles(currLoc[0],currLoc[1],dest[2],dest[3]))
        })
    // }
    //API term for destinations
    return destLocs


    let sources = [{ "location": [currLoc[0], currLoc[1]]}]
    let targets = new Array()
    destLocs.forEach((dest)=>{
        targets.push({ "location": [dest[2],dest[3]]})
    })
    let transpKeywrd;
    switch (transport){
        case con.transport_types[1]:{ //driving
            transpKeywrd = "drive"
            break;
        }
        case con.transport_types[2]:{ //walking
            transpKeywrd = "walk"
            break;
        }
        case con.transport_types[3]:{ //biking
            transpKeywrd = "bicycle"
            break;
        }
        case con.transport_types[4]:{ //public transport
            transpKeywrd = "transit"
            break;
        }
        default : throw "transportation type "+transport+" not supported"
    }
    let units;
    switch (distanceUnit){
        case "km" : {
            units = "metric"
            break;
        }
        case "mi" : {
            units = "imperial"
            break;
        }
        default:{
            units = "imperial"
            break
        }
    }

    //CALLING API
    const data = {
        "mode": transpKeywrd,
        "sources":sources,
        "targets":targets,
        "units":units
    }
    let url = GEOAPIFY_ENDPOINT + GEOAPIFY_KEY
    var config = {
        method: 'post',
        url: 'https://api.geoapify.com/v1/routematrix?apiKey=b48a8d4816bd4b5492719fdc1ece180a',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });
}

function calculateDistByTripMatrixWGoogleMaps(currLocLonLat, locsInRangeByCrow, distance, distanceUnit, transport){

}

async function attachApplicableReceipts(receipts, locations){
    await locations.forEach((loc)=>loc[5] = new Array())
    await receipts.forEach((rec)=>{
        if(rec.store_geolocation==null){
            loop1: locations.forEach((loc) => {
                if(compareLoc_NameString(recLoc(rec), loc)){
                    console.log("approved")
                    loc[5].push(rec)
                }
            })
        } else {
            locations.forEach((loc) =>{
                if(compareLoc_NameLatLon(recLoc(rec), loc)){
                    console.log("approved")
                    loc[5].push({
                        items: rec.items,
                        purchase_date: rec.purchase_date,
                        purchase_time: rec.purchase_time
                    })
                }
            })
        }
    })
    return locations
}

module.exports = {
    processPriceSearchInput,
    getAvailReceipts,
    getAvailLocations,
    insertFavorites,
    filterLocationsByDistance,
    distTwoLonLatPtsMiles,
    filterByCrowDistances,
    getGeoCode,
    calculateDistByTripMatrixWGeoapify,
    attachApplicableReceipts
}