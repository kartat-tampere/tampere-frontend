import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging, LocaleProvider } from 'oskari-ui/util';
import { MainPanel } from './components/MainPanel';
import { getService } from './service/layerservice';
import { LAYER_ID } from './components/Selection';
import { showPopup } from './components/Popup';
import { PopupContent } from './components/PopupContent';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

const SOURCEMATERIAL_ID = 'sourcematerial';
const clickedFeatures = {
    waiting: false
};
const handleFeaturesClicked = (delayed = false) => {
    const { coords, features, waiting } = clickedFeatures;
    if (!coords || !features || (waiting && !delayed)) {
        return;
    }
    if (!delayed) {
        // make sure we don't have a saved click from another location if we get
        // the features first.
        // Call itself again with a flag
        clickedFeatures.waiting = true;
        setTimeout(() => handleFeaturesClicked(true), 50);
        return;
    }
    clickedFeatures.waiting = false;
    console.log('features clicked', coords, features);
    getService(service => {
        const layers = service.getLayers();
        const getLayerName = (layerId) => layers.find(l => layerId.indexOf(l.id) > 10).name;
        const content = features.map(layerFeatures => {
            return {
                ...layerFeatures,
                layerName: Oskari.getLocalized(getLayerName(layerFeatures.layerId))
            };
        });
        showPopup(coords.lon, coords.lat, <PopupContent features={content} />);
        delete clickedFeatures.coords;
        delete clickedFeatures.features;
    });
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
                    delete clickedFeatures.coords;
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
