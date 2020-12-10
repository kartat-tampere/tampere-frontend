
export const addFeaturesToMap = (features, opts = {}) => {
    var options = {
        /*
        featureStyle: {
            stroke: {
                color: '#00FF00',
                width: 5
            },
            fill: {
                color: '#0000FF'
            }
        },
        */
        ...opts
    };
    const geojson = wrapToCollection(features);
    Oskari.getSandbox().postRequestByName(
        'MapModulePlugin.AddFeaturesToMapRequest', [geojson, options]);
};

export const clearFeaturesFromLayer = (layerId) => {
    Oskari.getSandbox().postRequestByName(
        'MapModulePlugin.RemoveFeaturesFromMapRequest', [null, null, layerId]);
};

const wrapToCollection = (features = []) => {
    if (!Array.isArray(features)) {
        features = [features];
    }
    return {
        type: 'FeatureCollection',
        crs: Oskari.getSandbox().getMap().getSrsName() || 'EPSG:3067',
        features: features
    };
};
