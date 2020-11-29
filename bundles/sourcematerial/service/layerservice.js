
const getFeatures = (bbox, layer, cb) => {
    var url = Oskari.urls.getRoute('GetWFSFeatures', { bbox, id: layer });
    jQuery.get(url, (result) => {
        cb(result);
    });
};

const parseResult = (data) => {
    return {
        getRoles: () => Object.keys(data),
        getLayers: (role) => data[role],
        getFeatures
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
