import '../styles/PriceShop.css';
import {React, useState, useEffect} from 'react';
import {useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PMCounter from '../components/PlusMinusNumberBox';

//UNIVERSAL CONSTANTS

// Added By Rheinard to stop error display when launching react app
const default_distance_search = true
const default_distance = 10
const default_distance_unit = "mi"
const default_transport = "driving"
const default_max_stores = 10
const favorite_stores = []

const unit_types = ["mi", "km", "minutes"];
const transport_types = ["straight line", "driving", "walking", "biking", "public transit"];

function PriceShop() {
    //checking if we have a user logged in, otherwise sends to login page
    const user = localStorage.getItem('user');
    const navigate = useNavigate();
    useEffect(() => {
      console.log("user", user);
      if (!user) {
         navigate('/Login');
          return;
       }
    }, [user, navigate]);

    //USER SPECIFIC DATA fetched from the user preferences in database (default refers to the default for the user)
    useEffect(() => {
        let default_distance, default_distance_unit, default_max_stores, default_transport, favorite_stores;
        axios.get('http://localhost:9000/getUserSearchPreferences', { params: {user}})
            .then((res) => {
                //res.data = {def_dist, def_dist_unit, def_max_stores, def_transp}
                if (res.data) {
                    default_distance = (res.data.def_dist);
                    default_distance_unit = (res.data.def_dist_unit);
                    default_max_stores = (res.data.def_max_stores);
                    default_transport = (res.data.def_transp);
                    favorite_stores=(res.data.fav_stores)
                    //this holds the an object representing the user's default search preferences
                } else {
                    console.error("program should never end up here (via '/getUserSearchPreferences'). This is here for debugging");
                }
            })
            .catch((err) => {
                console.log("error requesting user's default search data");
            }
        )
        console.log(default_distance, default_distance_unit, default_max_stores, default_transport, favorite_stores);
    }, [user])

    const [shopping_lists, setShoppingLists] = useState([""]);


    // const [user_id, setUser_id] = useState('');
    // const [stores, getStores] = useState(''); //represents all the store entries in the database


    //BASIC SEARCH info set by users
    const [shopping_list_id, setShoppingList] = useState(shopping_lists[0]);
    const [search_by_distance, setSearchByDistance] = useState(default_distance_search);

    //searchByDistance
    const [distance, setDistance] = useState(default_distance);
    //straightLine, driving, walking, biking, publicTransit
    const [distance_unit, setDistanceUnit] = useState(default_distance_unit);
    /*can be minutes (except for radialDistance), miles, kilometers*/
    const [transportation_type, setTransportType] = useState(((distance_unit==="minutes")&&(default_transport==="straight line")) ? transport_types[1] : default_transport);

    //ADVANCED SEARCH info set by users
    const [max_price_age_in_days, setMaxPriceAgeInDays] = useState(0); //0 is processed to mean any age
    const [stores_to_calculate, setStoresToCalculate] = useState(10);
    const [advancedSearchVisibility, setAdvancedSearchVisibility] = useState(false);

    /*
    //These are potential FUTURE FEATURES to maybe implement someday
    //makes exceptions for things such as meat being in weight, bread in units, etc... when possible
    //There would be some default exceptions that can get overridden by user ones
    //{(unitPreference, item1, item2, ...), (unitPreference, category), (unitPreference, tag) ...} item>category>newestTag>olderTag
    const [user_unit_exceptions, setUserUnitExceptions] = useState([][]);
    //allergens would require us to reliably find the ingredient information for each product the user submits
    const [user_allergens,getUserAllergens] = useState([])
    */

    //FUNCTIONS
    //fetching shoppingLists for user from database
    // useEffect(() => {
    //     axios.get('http://localhost:9000/getShoppingLists')
    //         .then(function (response) {
    //             setShoppingLists(response.data);
    //         })
    //         .catch(function (error) {
    //             console.log(error);
    //         })
    // }, [user])

    //fetching userPreferences from the database
    //defaultMaxStores (totalMaxStores collected from PMCounter when we hit Search)

    //called functions
    function checkValidUnitTransport(){
        if((distance_unit==="minutes")&&(transportation_type==="straight line")){
            console.log("messy")
            ((default_distance_unit!=="minutes")&&(default_distance_unit!=='')) ? setDistanceUnit({user_pref_distance_unit: default_distance_unit}) : setDistanceUnit('mi');
            document.getElementById("minuteOption").disabled=true;
            document.getElementById("mileOption");
        }
    };

    return (
    <div className="layout">
        <Sidebar/>
        <div className="content">
            <h1>Price Shop</h1>
            {/* <select onChange={(e) => setShoppingList(e.target.value)} value={shopping_list_id.trim}>
                {shopping_lists.map((shoppinglist, index) => {
                    return <option key={index} value={shoppinglist._id.trim}>
                    {shoppinglist.list_name}
                    </option>
                    })
                }
            </select> */}
            <div class="PrimarySearchParameterBox BoxOfRows">
                <div>
                    <b class="distance_label">distance</b>
                    <input
                            placeholder={10}
                            type="text"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                    />
                    <select id="selectUnit" onChange={(e) => {checkValidUnitTransport();setDistanceUnit(e.target.value);}} value={distance_unit.trim}>
                        <option value={unit_types[0].trim} id='mileOption'>
                            {unit_types[0]}
                        </option>
                        <option value={unit_types[1].trim}>
                            {unit_types[1]}
                        </option>
                        <option value={unit_types[2].trim} id='minuteOption'>
                            {unit_types[2]}
                        </option>
                    </select>
                    <select onChange={(e) => {checkValidUnitTransport();setTransportType(e.target.value)}} value={transportation_type.trim}>
                        {transport_types.map((trprtTy, index) =>
                            <option key={index} value={trprtTy.trim}>
                                {trprtTy}
                            </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div class="AdvancedSearchParameterBox BoxOfRows">
                <button class="collapseHeader" onClick={() => setAdvancedSearchVisibility(!advancedSearchVisibility)}><b>Advanced Settings</b></button>
                <div class="AdvancedSearchContents">
                    <div class="PMLabel">Stores to Search : </div>
                    <PMCounter initialValue={stores_to_calculate} minValue={1} maxValue={15} increment={1}></PMCounter>
                    <div class="PMLabel">Price Age limit (days):</div>
                    <PMCounter initialValue={max_price_age_in_days} minValue={0} maxValue={3*365} increment={1}/>

                </div>
            </div>
            <button class="search"><b>Search</b></button>
        </div>
    </div>
    );
};

export default PriceShop;