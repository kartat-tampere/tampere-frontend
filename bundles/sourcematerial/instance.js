import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging, LocaleProvider } from 'oskari-ui/util';
import { MainPanel } from './components/MainPanel';
import { getService } from './service/layerservice';
import { LAYER_ID } from './components/Selection';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

const SOURCEMATERIAL_ID = 'sourcematerial';
const clickedFeatures = {};
const handleFeaturesClicked = () => {
    const { coords, features } = clickedFeatures;
    if (!coords || !features) {
        return;
    }
    console.log('features clicked', coords, features);
    /*
    features: [{
        geojson: {type: "FeatureCollection", features: Array(1)}
        layerId: "SourceMaterialFeatures_2023"
    }]
    */
    delete clickedFeatures.coords;
    delete clickedFeatures.features;
};

let isDrawing = false;
let currentSelection;
const startDrawSelection = () => {
    currentSelection = null;
    Oskari.getSandbox().postRequestByName('DrawTools.StartDrawingRequest', [SOURCEMATERIAL_ID, 'Box']);
    isDrawing = true;
    getService(service => service.setSelection(null));
    updateUI();
};
const endDrawSelection = () => {
    Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [SOURCEMATERIAL_ID, true, true]);
    isDrawing = false;
    updateUI();
};
const toggleDrawing = () => {
    isDrawing ? endDrawSelection() : startDrawSelection();
};

const loc = Oskari.getMsg.bind(null, SOURCEMATERIAL_ID);
class SourceMaterialBundle extends BasicBundle {
    constructor () {
        super();
        this.__name = SOURCEMATERIAL_ID;
        this.loc = loc;
        this.eventHandlers = {
            DrawingEvent: (event) => {
                if (!event.getIsFinished() || event.getId() !== SOURCEMATERIAL_ID) {
                    // only interested in finished drawings for attachment selection
                    return;
                }
                currentSelection = event.getGeoJson().features[0];
                getService(service => service.setSelection(currentSelection));
                endDrawSelection();
            },
            MapClickedEvent: (event) => {
                clickedFeatures.coords = event.getLonLat();
                handleFeaturesClicked();
            },
            FeatureEvent: (event) => {
                if (event.getOperation() !== 'click') {
                    return;
                }
                const features = event.getParams().features.filter(f => f.layerId !== LAYER_ID);
                if (!features.length) {
                    return;
                }
                clickedFeatures.features = features;
                handleFeaturesClicked();
            }
        };
    }

    _startImpl () {
        // init service and call update UI that will get the same ref
        getService((service) => {
            service.addListener(() => updateUI(service));
            updateUI();
        });
    }
}

function updateUI () {
    getService((service) => {
        const hasAccess = service.getRoles().length > 0;
        if (!hasAccess) {
            Messaging.error(loc('accessdenied'));
            return;
        }
        const state = service.getState();
        ReactDOM.render(
            <LocaleProvider value={{ bundleKey: SOURCEMATERIAL_ID }}>
                <MainPanel service={service}
                    drawControl={toggleDrawing}
                    isDrawing={isDrawing}
                    state={state} />
            </LocaleProvider>, getRoot());
    });
}

let root = null;
function getRoot () {
    if (!root) {
        const mapEl = document.getElementById('contentMap');
        root = document.createElement('div');
        mapEl.appendChild(root);
    }
    return root;
}

// so bundle.js can reference this
Oskari.clazz.defineES('Oskari.sourcematerial.BundleInstance', SourceMaterialBundle);
