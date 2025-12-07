import '../styles/PriceShop.css';
import {React, useState, useEffect, useRef} from 'react';
import {Await, useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import PMCounter from '../components/priceShop/PlusMinusNumberBox';
import {distance_unit_types, transport_types, sys_default_distance,sys_default_distance_unit,
    sys_default_max_stores, sys_default_transport, sys_default_prioritize_favorites,
    sys_default_max_price_age, sys_favorite_stores, max_stores_calculated} from '../constants';

function AdvancedSettings(prioritize_favorites, max_stores, age_default){
    const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

    let initVal = ((typeof prioritize_favorites)==="boolean")? prioritize_favorites : sys_default_prioritize_favorites;
    const [prior_favs, setPriorFavs] = useState(initVal)

    return <div className="AdvancedSearchParameterBox BoxOfRows">
        <button className="collapseHeader" onClick={() => setAdvancedSearchVisible(!advancedSearchVisible)}><b>Advanced Settings</b></button>
        <div hidden={advancedSearchVisible} className="AdvancedSearchContents" id="AdvancedSearchContents">
            <div>prioritize favorites?</div>
            <button description="checkbox" className="PMElem" onClick={() => {setPriorFavs(!prior_favs);}} value={prior_favs}>{(prior_favs)? "yes" : "no"}</button>
            <MaxStoresCounter max_stores_default={max_stores} />
            <MaxPriceAgeCounter age_default={sys_default_max_price_age} />
        </div>
    </div>
}

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
        &&((distance_unit_default!==distance_unit_types[0])||(distance_transport_default!==transport_types[0])))
        ? distance_transport_default : sys_default_transport);

    return <div>
        <b className="distance_label">distance</b>
        <input
                placeholder={distance}
                type="text"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
        />
        <select key="selectUnit" onChange={(e) => {setDistanceUnit(e.target.value)}} value={distance_unit}>
            <option value={distance_unit_types[0]} key='minuteOption' disabled={transportation_type===transport_types[0]}>
                {distance_unit_types[0]}
            </option>
            <option value={distance_unit_types[1]} key='mileOption'>
                {distance_unit_types[1]}
            </option>
            <option value={distance_unit_types[2]} key="kmOption">
                {distance_unit_types[2]}
            </option>
        </select>
        <select key="selectTransport" onChange={(e) => {setTransportType(e.target.value);}} value={transportation_type}>
            {transport_types.map((trprtTy) =>
                (trprtTy===transport_types[0]) ?
                    <option key={trprtTy.concat("Option")} value={trprtTy} disabled={distance_unit===distance_unit_types[0]}>
                        {trprtTy}
                    </option>
                :
                    <option key={trprtTy.concat("Option")} value={trprtTy}>
                        {trprtTy}
                    </option>
            )
            }
        </select>
    </div>
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

function PriceShop() {
    //USER SPECIFIC DATA fetched from the user preferences in database (default refers to the default for the user)
    let distance = useRef();
    let distance_unit = useRef();
    let max_stores = useRef();
    let transport = useRef();
    let prioritize_favorites = useRef();
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

    const getShoppingLists = async () => {
        axios.get('http://localhost:9000/getShoppingLists', { params: {user}}).then((resSL) => {
            shopping_lists.current = resSL.data;
            console.log("ShoppingLists", resSL.data)
        }).then(()=>{
            setIsLoaded(true)
        }).catch((err)=>{
            console.log("error requesting user's shopping lists", err);
        })
    }

    //fetching user search preferences from the server
    const getUserSearchPreferences = async () => {
        axios.get('http://localhost:9000/getUserSearchPreferences', { params: {user}}).then((res) => {
            console.log("user preferences request's response.data: ", res.data);
            getShoppingLists();
            if (res.data) {
                //res.data holds an object representing the user's default search preferences
                distance.current = (res.data.def_dist>=0)? res.data.def_dist : sys_default_distance;
                distance_unit.current = distance_unit_types.includes(res.data.def_dist_unit) ? res.data.def_dist_unit : sys_default_distance_unit;
                max_stores.current = (res.data.def_max_stores < max_stores_calculated && res.data.def_max_stores > 0)? res.data.def_max_stores : sys_default_max_stores;
                //we cannot have transport equal to minutes if distance unit is equal to straight line
                transport.current = ((transport_types.includes(res.data.def_transp) && (res.data.def_transp!=="straight line" || res.data.def_dist_unit!=="minutes")) ? res.data.def_transp : sys_default_transport);
                prioritize_favorites.current = ((typeof res.data.def_prio_favs)==="boolean")? res.data.def_prio_favs : sys_default_prioritize_favorites;
                favorite_stores.current = (res.data.fav_stores.length!==0) ? res.data.fav_stores : sys_favorite_stores;
            }else {
                console.error("program should never end up here (via '/getUserSearchPreferences'). This is here for debugging");
            }
        }).then(()=>{
            console.log("and finally these are the resulting values:",
                "\ndefault_distance:", distance, "\ndefault_distance_unit:", distance_unit,
                "\ndefault_max_stores:", max_stores, "\ndefault_transport:", transport,
                "\nfavorite_stores:", favorite_stores);
            }).catch((err) => {
                console.log("error requesting user's default search data", err);
            });
    };

    useEffect(() => {
        getUserSearchPreferences();
    }, [user]);

    /*
    //These are potential FUTURE FEATURES to maybe implement someday
    //makes exceptions for things such as meat being in weight, bread in units, etc... when possible
    //There would be some default exceptions that can get overridden by user ones
    //{(unitPreference, item1, item2, ...), (unitPreference, category), (unitPreference, tag) ...} item>category>newestTag>olderTag
    const [user_unit_exceptions, setUserUnitExceptions] = useState([][]);
    //allergens would require us to reliably find the ingredient information for each product the user submits
    const [user_allergens,getUserAllergens] = useState([])
    */


    const [isLoaded, setIsLoaded] = useState(distance.current!=null && distance_unit.current!=null&&max_stores.current!=null&&transport.current!=null&&prioritize_favorites.current!=null&&favorite_stores.current!=null)

    useEffect(() => {
        if(isLoaded) {
            console.log("page is loaded")
        } else {
            console.log("waiting")
        }
        }, [isLoaded]);

    const getLoadedPage = () => {
        return <>
            <Sidebar />
            <div className="content" id="content">
                <h1><b>Price Shop</b></h1>
                <div className="PrimarySearchParameterBox BoxOfRows">
                    <ShoppingListRow shoppingLists={shopping_lists.current} />
                    <DistanceSelector distance_val_default={distance.current} distance_unit_default={distance_unit.current} distance_transport_default={transport.current} />
                </div>
                <AdvancedSettings/>
                <button className="search" onClick={submitSearch}><b>Search</b></button>
            </div>
        </>;
    }

    if(!isLoaded){
        return <div className="layout"><h1>LOADING</h1></div>
    } else {
        let retVal = <div className="layout">
            {getLoadedPage()}
        </div>;
        return retVal
    }

    //POSTSUBMISSION
    function submitSearch(){
        //basic settings
        let [basicSettings,advancedSettings] =document.getElementById("content").getElementsByClassName("BoxOfRows");
        let [shoppingList, distance] = basicSettings.children
        shoppingList = (shoppingList.children[1].value);
        let distanceUnit = distance.children[2].value;
        let transport = distance.children[3].value;
        distance = distance.children[1].value;

        //advanced settings
        advancedSettings=advancedSettings.children[1]
        let maxPriceAge = advancedSettings.children[3].children[1].value;
        let maxStores = advancedSettings.children[5].children[1].value;
        let prioritize_favorites = advancedSettings.children[1].value;
        let fav_stores = favorite_stores.current;
        let fav_stores_length = favorite_stores.current.length;
        console.log("BASIC SETTINGS\n",
            "\nshoppingList:", shoppingList,
            "\ndistance:",distance,
            "\ndistanceUnit:",distanceUnit,
            "\ntransportation type:",transport,
            "\n\nADVANCED SETTINGS",
            "\nprioritize_favorites:", prioritize_favorites,
            "\nmaxPriceAge:", maxPriceAge,
            "\nmaxStores:", maxStores,
            "\nnum_faves", fav_stores_length,
            "\nfav_stores", fav_stores);

        {axios.get('http://localhost:9000/priceSearch', { params: {
            username: user,
            shoppingList: shoppingList,
            distance: distance,
            distance_unit: distanceUnit,
            transport: transport,
            prior_faves: prioritize_favorites,
            max_price_age: maxPriceAge,
            max_stores: maxStores,
            fav_stores_length: fav_stores_length,
            favorite_stores
        }}).then((res) => {
                //res.data =
                if (res.data) {
                    //this holds the an object representing the user's search results
                } else {
                    console.error("program should never end up here (via '/getUserSearchPreferences'). This is here for debugging");
                }
            })
            .catch((err) => {
                console.log("error requesting user's default search data");
            }
        )}
    }
} export default PriceShop;
