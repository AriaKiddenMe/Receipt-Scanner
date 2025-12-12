const distance_unit_types = ["minutes", "mi", "km"]
const transport_types = ["by the crow (straight line)", "driving", "walking", "biking", "public transit"];
const con = {
    distance_unit_types: distance_unit_types,
    transport_types: transport_types,
    sys_default_distance : 10,
    sys_default_distance_unit : distance_unit_types[1], //should never be equal to 'minutes' (index 0)
    sys_default_max_stores : 5,
    sys_default_transport : transport_types[1], //should never be equal to 'straight line' (index 0)
    sys_default_prioritize_favorites : true,
    sys_default_max_price_age : 0, //which indicates no limit
    sys_favorite_stores : ["<no favorites given>"],
    max_stores_calculated : 15,
    lat_lon_defaults : 400
}

export {con}