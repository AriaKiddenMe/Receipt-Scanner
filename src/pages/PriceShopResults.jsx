
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

    //fetching shoppingLists for user from database
    const getUserShoppingLists= () =>{
        axios.get('http://localhost:9000/getUserSearchPreferences', { params: {user}})
        .then( (res) => {
            console.log("yet to implement shopping lists")
            //shopping_lists.current = response.data.lists;
        }).catch(function (error) {
            console.log(error);
        })
        console.log("Server returned the following Shopping Lists: ");
        console.log("not implemented");
    }