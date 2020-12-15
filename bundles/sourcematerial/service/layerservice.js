
/**
 * Roles
 */
let currentRole = null;
const setCurrentRole = role => {
    currentRole = role;
    if (bbox && currentRole) {
        // trigger loading
        service.getLayers(role).forEach(l => loadFeatures(l.id));
        // TODO: remove layers that have features but are not part of this role?
    }
    notify();
};

/**
 * Loading indicators
 */
const isLoading = {};
const startLoading = layer => {
    let count = isLoading[layer];
    if (!count) {
        count = 0;
    }
    isLoading[layer] = count + 1;
    layerFeatures[layer] = null;
    notify();
};

const loadingCompleted = layer => {
    isLoading[layer] = isLoading[layer] - 1;
    notify();
};

const isLayerLoading = (layer) => layerFeatures[layer] === 0;

/**
 * Current selection
 */
let currentSelection = null;
let bbox = null;
const setSelection = (feature) => {
    currentSelection = feature;
    bbox = getBBOX(feature);
    if (bbox && currentRole) {
        service.getLayers(currentRole).forEach(l => loadFeatures(l.id));
    }
    notify();
};

const getBBOX = () => {
    if (!currentSelection) {
        return null;
    }

    const coords = currentSelection.geometry.coordinates[0];
    const bbox = coords[0].concat(coords[2]);
    // the correct order might be 0,3,2,1
    return bbox;
};

/**
 * Layer features
 */
const layerFeatures = {};

const loadFeatures = (layer) => {
    if (!bbox) {
        return;
    }
    startLoading(layer);
    var url = Oskari.urls.getRoute('GetWFSFeatures', {
        bbox: bbox.join(),
        srs: Oskari.getSandbox().getMap().getSrsName() || 'EPSG:3067',
        id: layer
    });
    jQuery.get(url, (result) => {
        layerFeatures[layer] = result.features;
    }).fail(() => {
        // cb();
        // null layerFeatures[layer] and NOT loading -> error
    }).done(() => {
        loadingCompleted(layer);
        notify();
    });
};

const getFeatures = layer => {
    return layerFeatures[layer];
};
const getState = () => {
    let layers = service.getLayers(currentRole).map(layer => {
        return {
            layer,
            features: getFeatures(layer.id),
            loading: isLayerLoading(layer.id)
        };
    });
    return {
        roles: service.getRoles(),
        currentRole,
        currentSelection,
        bbox,
        layers
    };
};

/**
 * service and listeners
 */
const listeners = [];
const notify = (data) => listeners.forEach(handler => handler(data));
const addListener = (handler) => listeners.push(handler);
const parseResult = (data) => {
    setCurrentRole(Object.keys(data)[0]);
    return {
        getRoles: () => Object.keys(data),
        getLayers: (role = currentRole) => data[role] || [],
        getBBOX,
        getFeatures,
        addListener,
        loadFeatures,
        setSelection,
        setCurrentRole,
        getCurrentRole: () => currentRole,
        isLayerLoading,
        getState
    };
};

let service;

export const getService = (done) => {
    if (service) {
        return done(service);
    }
    var url = Oskari.urls.getRoute('SourceMaterial');
    jQuery.get(url, (result) => {
        service = parseResult(result);
        done(service);
    }).fail(() => {
        service = parseResult({});
        done(service);
    });
};
