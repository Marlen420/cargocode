const CONFIG = {
    mapboxGeocodeUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places/',
    mapboxDistanceCalculationurl: "https://api.mapbox.com/directions/v5/mapbox/driving/",
    priceSystem: {
        currency: 'usd',
        baseRatePerMile: 1,
        weightFactorPerPound: 0.05,
        volumeFactorPerCubicFoot: 0.01,
        urgencyFactorPercent: 20,
        specialHandlingFactorPercent: 15,
        urbanRoutesPercent: 10,
        ruralRoutesPercent: -5
    }


}

export default CONFIG;