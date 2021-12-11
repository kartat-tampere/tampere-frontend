import React from 'react';
import ReactDOM from 'react-dom';
import { Message } from 'oskari-ui';
import { Messaging, LocaleProvider } from 'oskari-ui/util';
import { MainPanel } from './components/MainPanel';
import { showPopup, hidePopup } from './components/Popup';
import { Basket } from './basket';
import { processFeatures } from './helpers/featureshelper';
import { getLayers, getLayerFromService } from './helpers/layerHelper';
import { getFeaturesInGeom } from './helpers/geomSelector';
import { QNAME } from 'oskari-frontend/bundles/mapping/mapmodule/service/VectorFeatureSelectionService';

Basket.onChange(updateUI);

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

const FEATURE_SELECT_ID = 'attachmentSelection';
let isDrawing = false;
const startDrawSelection = () => {
    Oskari.getSandbox().postRequestByName('DrawTools.StartDrawingRequest', [FEATURE_SELECT_ID, 'Polygon']);
    isDrawing = true;
    updateUI();
};
const endDrawSelection = () => {
    Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [FEATURE_SELECT_ID, true, true]);
    isDrawing = false;
    updateUI();
};
const toggleDrawing = () => {
    isDrawing ? endDrawSelection() : startDrawSelection();
};

const clickedFeatures = {
    waiting: false
};

const handleFeaturesClicked = (delayed = false) => {
    const { coords, features, waiting } = clickedFeatures;
    if (!coords || !features) {
        // we don't yet have one of the two things we need
        return;
    }
    if (waiting && !delayed) {
        // another call scheduled as a delayed call. Wait for it instead.
        return;
    }
    if (!delayed) {
        // make sure we don't have a saved click from another location if we get
        // the features first. Call itself again with a flag to identify a delayed call.
        clickedFeatures.waiting = true;
        setTimeout(() => handleFeaturesClicked(true), 50);
        return;
    }
    // reset waiting if we get this far
    // -> called with delay so we can start expecting more delayed calls
    clickedFeatures.waiting = false;

    processFeatures(features, (features) => {
        showPopup(coords.lon, coords.lat, features[0]);
        delete clickedFeatures.coords;
        delete clickedFeatures.features;
    });
};

class FileLayerListBundle extends BasicBundle {
    constructor () {
        super();
        this.__name = 'file-layerlist';
        this.loc = Oskari.getMsg.bind(null, this.__name);
        this.eventHandlers = {
            AfterMapLayerAddEvent: () => {
                updateUI();
            },
            AfterMapLayerRemoveEvent: () => {
                updateUI();
            },
            MapClickedEvent: (event) => {
                console.log(event.getLonLat());
                clickedFeatures.coords = event.getLonLat();
                handleFeaturesClicked();
            },
            FeatureEvent: (event) => {
                if (event.getOperation() !== 'click') {
                    return;
                }

                const features = event.getParams().features.filter(f => f.layerId === getSelectedWFSLayerId());
                if (!features.length) {
                    delete clickedFeatures.coords;
                    return;
                }
                clickedFeatures.features = features;
                handleFeaturesClicked();
            },
            DrawingEvent: (event) => {
                if (!event.getIsFinished() || event.getId() !== FEATURE_SELECT_ID) {
                    // only interested in finished drawings for attachment selection
                    return;
                }
                endDrawSelection();
                const layerId = getSelectedWFSLayerId();
                if (!layerId) {
                    return;
                }
                const features = getFeaturesInGeom(event.getGeoJson().features[0].geometry, layerId);
                const mapped = features.map(f => {
                    const value = {
                        ...f.getProperties(),
                        _$layerId: layerId
                    };
                    delete value.geometry;
                    return value;
                });
                processFeatures(mapped, (features) => {
                    const featuresWithFiles = features.filter(feat => feat._$files && feat._$files.length);
                    featuresWithFiles.forEach(feat => { Basket.add(feat); });
                    if (featuresWithFiles.length) {
                        Messaging.success(<Message messageKey='addedToBasket' bundleKey='file-layerlist' />);
                    } else {
                        Messaging.warn(<Message messageKey='drawNoHits' bundleKey='file-layerlist' />);
                    }
                });
            }
        };
    }

    _startImpl () {
        updateUI();
    }
}

function getSelectedWFSLayerId () {
    const selectedLayers = Oskari.getSandbox().getMap().getLayers().filter(l => l.isLayerOfType('WFS'));
    if (!selectedLayers.length) {
        // No WFS-layers selected
        // TODO: don't allow draw if no layers selected...
        return;
    }
    return selectedLayers[0].getId();
}
function highlightFeatures () {
    const selectionService = Oskari.getSandbox().getService(QNAME);
    selectionService.removeSelection();
    const features = Basket.list();
    if (!features.length) {
        return;
    }
    const layer = getLayerFromService(getSelectedWFSLayerId());
    if (!layer) {
        return;
    }
    const featureIds = features
        .filter(f => f._$layerId === layer.getId())
        .map(f => f._oid);
    selectionService.setSelectedFeatureIds(layer.getId(), featureIds);
    // TODO: group by layer etc
}

function updateUI () {
    getLayers((layers) => {
        // hide any possibly open popups on map before re-render (in case layer was removed etc)
        hidePopup();
        // update highlighted features based on basket content
        highlightFeatures();
        const selectedLayers = Oskari.getSandbox().getMap().getLayers();
        ReactDOM.render(
            <LocaleProvider value={{ bundleKey: 'file-layerlist' }}>
                <MainPanel layers={layers} selectedLayers={selectedLayers} drawControl={toggleDrawing} isDrawing={isDrawing}/>
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
Oskari.clazz.defineES('Oskari.file-layerlist.BundleInstance', FileLayerListBundle);
