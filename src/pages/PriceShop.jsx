import '../styles/PriceShop.css';
import {React, useState, useEffect, useRef} from 'react';
import {useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PMCounter from '../components/priceShop/PlusMinusNumberBox';
import {distance_unit_types, transport_types, sys_default_distance,sys_default_distance_unit,
    sys_default_max_stores, sys_default_transport, sys_default_prioritize_favorites,
    sys_default_max_price_age, sys_favorite_stores, max_stores_calculated} from '../constants';

function ShoppingListRow({shoppingLists}){
    const shopping_lists = (
        //is an array
        (Array.isArray(shoppingLists)
        //of strings
        && (shoppingLists.length > 0) && (typeof shoppingLists[0]==="string")) ?
        shoppingLists : ["<no lists available>"])
    const [shopping_list, setShoppingList] = useState(shopping_lists[0])
    return<div>
        <b>list</b>
        <select key="selectShoppingList" onChange={(e) => setShoppingList(e.target.value)} value={shopping_list}>
            {shopping_lists.map((listName, index) => <option key={"ShoppingList".concat(index,listName)} value={listName}>{listName}</option>)}
        </select>
    </div>
}

function DistanceSelector({distance_val_default, distance_unit_default, distance_transport_default}){
    const [distance, setDistance] = useState(
        (((typeof distance_val_default)==="number") && distance_val_default>=0)
        ? distance_val_default : sys_default_distance);
    const [distance_unit, setDistanceUnit] = useState(distance_unit_types.includes(distance_unit_default)
    ? distance_unit_default : sys_default_distance_unit);
    const [transportation_type, setTransportType] = useState(
        (transport_types.includes(distance_unit_default)
        &&((distance_unit_default!=="minutes")||(distance_transport_default!=="straight line")))
        ? distance_transport_default : sys_default_transport);

    function checkValidUnitTransportThenUpdate(elementKey, value){
        if(elementKey==="selectUnit"){
            if((value==="minutes")){
                document.getElementByKey("straight lineOption").disabled=true;
            } else if(distance_unit==="minutes") {
                document.getElementByKey("straight lineOption").disabled=false;
            }
            setDistanceUnit(value);
        } else if(elementKey==="selectTransport"){
            if(value==="straight line"){
                document.getElementByKey("minuteOption").disabled=true;
            } else if(transportation_type==="straight line") {
                document.getElementByKey("minuteOption").disabled=false;
            };
            setTransportType(value);
        } else {console.error("we should never end up here, checkValidUnitTransportThenUpdate handed an incorrect element ID");}
    };

    return <div>
        <b className="distance_label">distance</b>
        <input
                placeholder={distance}
                type="text"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
        />
        <select key="selectUnit" onChange={(e) => {checkValidUnitTransportThenUpdate(this.key, e.target.value);}} value={distance_unit}>
            <option value={distance_unit_types[0]} key='minuteOption'>
                {distance_unit_types[0]}
            </option>
            <option value={distance_unit_types[1]} key='mileOption'>
                {distance_unit_types[1]}
            </option>
            <option value={distance_unit_types[2]} key="kmOption">
                {distance_unit_types[2]}
            </option>
        </select>
        <select key="selectTransport" onChange={(e) => {checkValidUnitTransportThenUpdate(this.key, e.target.value);}} value={transportation_type}>
            {transport_types.map((trprtTy) =>
                <option key={trprtTy.concat("Option")} value={trprtTy.trim}>
                    {trprtTy}
                </option>
                )
            }
        </select>
    </div>
}

function PrioritizeFavoritesCheckBox({default_prioritize_favorites}){
    const [prioritize_favorites, setPriotirizeFavorites] = useState(
        ((typeof default_prioritize_favorites)==="boolean")? default_prioritize_favorites : sys_default_prioritize_favorites);
    return <>
        <div>prioritize favorites?</div>
        <button description="checkbox" className="PMElem" onClick={() => setPriotirizeFavorites(!prioritize_favorites)}></button>
    </>
}

function MaxStoresCounter({max_stores_default}){
    return <>
        <div className="PMLabel">Stores to Search : </div>
        <PMCounter initialValue={(((typeof max_stores_default)==="number") && max_stores_default > 0) ?
            max_stores_default:sys_default_max_stores}
            minValue={1} maxValue={max_stores_calculated} increment={1}></PMCounter>
    </>
}

function MaxPriceAgeCounter({age_default}){
    return <>
        <div className="PMLabel">Price Age limit (days):</div>
        <PMCounter initialValue={(age_default >= 0) ? age_default : sys_default_max_price_age} minValue={0} maxValue={3*365} increment={1}/>
    </>
}

//UNIVERSAL CONSTANTS
function PriceShop() {
    //USER SPECIFIC DATA fetched from the user preferences in database (default refers to the default for the user)
    let default_distance = useRef();
    let default_distance_unit = useRef();
    let default_max_stores = useRef();
    let default_transport = useRef();
    let default_prioritize_favorites = useRef();
    let favorite_stores = useRef();

    let shopping_lists = useRef();

    //checking if we have a user logged in, otherwise sends to login page
    const user = localStorage.getItem('user');
    const navigate = useNavigate();
    useEffect(() => {
        console.log("user:", user);
        if (!user) {
            navigate('/Login');
            return;
        }
    }, [user, navigate]);

    //fetching user search preferences from the server
    const getUserSearchPreferences = () => {
        axios.get('http://localhost:9000/getUserSearchPreferences', { params: {user}}).then((res) => {
            console.log("This is the response: ", res);
            console.log("This is the response.data: ", res.data);
            if (res.data) {
                //res.data holds an object representing the user's default search preferences
                default_distance.current = (res.data.def_dist>=0)? res.data.def_dist : sys_default_distance;
                default_distance_unit.current = distance_unit_types.includes(res.data.def_dist_unit) ? res.data.def_dist_unit : sys_default_distance_unit;
                default_max_stores.current = (res.data.def_max_stores < max_stores_calculated && res.data.def_max_stores > 0)? res.data.def_max_stores : sys_default_max_stores;
                //we cannot have transport equal to minutes if distance unit is equal to straight line
                default_transport.current = ((transport_types.includes(res.data.def_transp) && (res.data.def_transp!=="straight line" || res.data.def_dist_unit!=="minutes")) ? res.data.def_transp : sys_default_transport);
                default_prioritize_favorites.current = ((typeof res.data.def_prio_favs)==="boolean")? res.data.def_prio_favs : sys_default_prioritize_favorites;
                favorite_stores.current = (res.data.fav_stores)? res.data.fav_stores : sys_favorite_stores;
            }else {
                console.error("program should never end up here (via '/getUserSearchPreferences'). This is here for debugging");
            }
        }).then(getUserShoppingLists()).then(()=>{
            console.log("and finally these are the resulting values:",
                "\ndefault_distance:", default_distance, "\ndefault_distance_unit:", default_distance_unit,
                "\ndefault_max_stores:", default_max_stores, "\ndefault_transport:", default_transport,
                "\nfavorite_stores:", favorite_stores);
        })
        .catch((err) => {
            console.log("error requesting user's default search data", err);
        });

    };
    //fetching shoppingLists for user from database
    const getUserShoppingLists= () =>{
        axios.get('http://localhost:9000/getUserSearchPreferences', { params: {user}})
        .then( (res) => {
            console.log("yet to implement shopping lists")
            //shopping_lists.current = response.data.lists;
        }).then(()=>{setIsLoaded(true)}).catch(function (error) {
            console.log(error);
        })
        console.log("Server returned the following Shopping Lists: ");
        console.log("not implemented");
    }

    //functions like a constructor, but also updates when user changes
    useEffect(() => {
        getUserSearchPreferences();
    }, [user]);

    //ADVANCED SEARCH info set by users
    let shoppingLists = ["list1", "list2"];

    /*
    //These are potential FUTURE FEATURES to maybe implement someday
    //makes exceptions for things such as meat being in weight, bread in units, etc... when possible
    //There would be some default exceptions that can get overridden by user ones
    //{(unitPreference, item1, item2, ...), (unitPreference, category), (unitPreference, tag) ...} item>category>newestTag>olderTag
    const [user_unit_exceptions, setUserUnitExceptions] = useState([][]);
    //allergens would require us to reliably find the ingredient information for each product the user submits
    const [user_allergens,getUserAllergens] = useState([])
    */


    //fetching userPreferences from the database
    //defaultMaxStores (totalMaxStores collected from PMCounter when we hit Search)

    function submitSearch(){}
    //     console.log("search not yet implemented");
    //     axios.get('http://localhost:9000/search', { params: {
    //         username: user,
    //         shop_list_id: shopping_list_id,
    //         distance: distance,
    //         distance_unit: distance_unit,
    //         transport: transportation_type,
    //         prior_faves: prioritize_favorites,
    //         max_price_age: max_price_age_in_days,
    //         max_stores: stores_to_calculate,
    //         fav_stores: favorite_stores
    //     }})
    //         .then((res) => {
    //             //res.data = {def_dist, def_dist_unit, def_max_stores, def_transp}
    //             if (res.data) {
    //                 default_distance = (res.data.def_dist);
    //                 default_distance_unit = (res.data.def_dist_unit);
    //                 default_max_stores = (res.data.def_max_stores);
    //                 default_transport = (res.data.def_transp);
    //                 default_prioritize_favorites = (res.data.def_prio_favs);
    //                 favorite_stores=(res.data.fav_stores)
    //                 //this holds the an object representing the user's default search preferences
    //             } else {
    //                 console.error("program should never end up here (via '/getUserSearchPreferences'). This is here for debugging");
    //             }
    //         })
    //         .catch((err) => {
    //             console.log("error requesting user's default search data");
    //         }
    //     )
    // }

    const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

    function toggleAdvancedSearchVisibility(val){
        setAdvancedSearchVisible(val)
    }

    const [isLoaded, setIsLoaded] = useState(default_distance.current!=null && default_distance_unit.current!=null&&default_max_stores.current!=null&&default_transport.current!=null&&default_prioritize_favorites.current!=null&&favorite_stores.current!=null)

    useEffect(() => {
        if(isLoaded) {
            console.log("page is loaded")
        } else {
            console.log("waiting")
        }
        setAdvancedSearchVisible(false);
        }, [isLoaded]);

    const getLoadedPage = () => {
        return <>
            <Sidebar />
            <div className="content">
                <h1><b>Price Shop</b></h1>
                <div className="PrimarySearchParameterBox BoxOfRows">
                    <ShoppingListRow shoppingLists={shoppingLists.current} />
                    <DistanceSelector distance_val_default={default_distance.current} distance_unit_default={default_distance_unit.current} distance_transport_default={default_transport.current} />
                </div>
                <div className="AdvancedSearchParameterBox BoxOfRows">
                    <button className="collapseHeader" onClick={() => toggleAdvancedSearchVisibility(!advancedSearchVisible)}><b>Advanced Settings</b></button>
                    <div className="AdvancedSearchContents" id="AdvancedSearchContents" hidden={!advancedSearchVisible}>
                        <PrioritizeFavoritesCheckBox default_prioritize_favorites={default_prioritize_favorites.current} />
                        <MaxStoresCounter max_stores_default={default_max_stores.current} />
                        <MaxPriceAgeCounter age_default={sys_default_max_price_age} />
                    </div>
                </div>
                <button className="search" onClick={submitSearch}><b>Search</b></button>
            </div>
        </>;
    }

    if(!isLoaded){
        console.log("loading because:",
            "\ndefault_distance:", default_distance, "\ndefault_distance_unit:", default_distance_unit,
            "\ndefault_max_stores:", default_max_stores, "\ndefault_transport:", default_transport,
            "\nfavorite_stores:", favorite_stores);
        return <div className="layout"><h1>LOADING</h1></div>
    } else {
        let retVal = <div className="layout">
            {getLoadedPage()}
        </div>;
        return retVal
    }
} export default PriceShop;