import '../styles/PriceShop.css';
import {React, useState, useEffect} from 'react';
import {useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PMNumberBox from '../components/PlusMinusNumberBox';

function PriceShop() {
    //UNIVERSAL CONSTANTS
    const unit_types = ["mi", "km", "minutes"];
    const transport_types = ["straight line", "driving", "walking", "biking", "public transit"];

    //checking if we have a user logged in, otherwise sends to login page
    // const user = localStorage.getItem('user');
    // const navigate = useNavigate();
    // useEffect(() => {
    //   console.log("user", user);
    //   if (!user) {
    //      navigate('/Login');
    //       return;
    //    }
    // }, [user, navigate]);

    // const [user_id, setUser_id] = useState('');
    // const [stores, getStores] = useState(''); //represents all the store entries in the database

    //BASIC SEARCH info set by users
    const [distance, setDistance] = useState('');
    // const [search_by_distance, setSearchByDistance] = useState('');
    // const [shopping_list_id, setShoppingList] = useState([]);
    // const [favored_stores_list_id, setStoreID] = useState([]);

    //ADVANCED SEARCH info set by users
    // const [max_price_age_days, setMaxPriceAgeDays] = useState();
    // const [min_stores, setMinStores] = useState(1);
    // const [max_stores, setMaxStores] = useState(1);
    /*can be minutes (except for radialDistance), miles, kilometers*/
    const [distance_measurement_unit, setDistanceMeasurementUnit] = useState('');
    //straightLine, driving, walking, biking, publicTransit
    const [transportation_type, setTransportType] = useState('');

    //USER SPECIFIC DATA fetched from the user preferences in database
    //indicates the preferred units for the user to see in order from most to least preffered
    // const [default_distance, setDefaultDistance]= useState(Number);
    const [user_pref_distance_unit, setUserPrefDistanceUnit]= useState('');
    // const [default_transport, setDefaultTransport] = useState('');
    // const [unit_preferences_order, setUnitPreferencesOrder] = useState([]); //for shopping list items
    // const [shopping_lists, setShoppingLists] = useState([]);
    // const [favored_stores_lists, setFavoredStoresLists] = useState([]);

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


    //called functions
    function checkValidUnitTransport(){
        if((distance_measurement_unit==="minutes")&&(transportation_type==="straight line")){
            console.log("messy")
            ((user_pref_distance_unit!=="minutes")&&(user_pref_distance_unit!=='')) ? setDistanceMeasurementUnit({user_pref_distance_unit}) : setDistanceMeasurementUnit('mi');
            document.getElementById("minuteOption").disabled=true;
            document.getElementById("mileOption");
        }
    };

    //const toggleCollapsedSettings = (e)=> console.log(e);
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
            <input
                    // placeholder={default_distance}
                    placeholder={0}
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
            />
            <select id="selectUnit" onChange={(e) => {checkValidUnitTransport();setDistanceMeasurementUnit(e.target.value);}} value={distance_measurement_unit.trim}>
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
            {/* <button type="button" class="collapseHeader" onClick={(e) => toggleCollapsedSettings(e.)}>Advanced Settings</button>
            <div class="collapsingSettingsContent">
                <p>Lorem ipsum... asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf asdfasdfasdfasdfasdfasdfasdf</p>
            </div> */}
            <table>
                <PMNumberBox initialValue={1} minValue={1} maxValue={7} increment={1}></PMNumberBox>
            </table>
        </div>
    </div>
    );
};

export default PriceShop;