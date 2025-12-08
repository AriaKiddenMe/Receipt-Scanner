export const
    distance_unit_types = ["minutes", "mi", "km"],
    transport_types = ["by the crow (straight line)", "driving", "walking", "biking", "public transit"],
    sys_default_distance = 10,
    sys_default_distance_unit = distance_unit_types[1], //should never be equal to 'minutes' (index 0)
    sys_default_max_stores = 5,
    sys_default_transport = transport_types[1], //should never be equal to 'straight line' (index 0)
    sys_default_prioritize_favorites = true,
    sys_default_max_price_age = 0, //which indicates no limit
    sys_favorite_stores = ["<no favorites given>"],
    max_stores_calculated=15,
    lat_lon_defaults=400,
    oneDegreelatitudeEstMi = 69,
    oneDegreelongitudeEstMi = 54.6,
    oneDegreelatitudeEstkm = 111,
    oneDegreelongitudeEstkm = 87.9