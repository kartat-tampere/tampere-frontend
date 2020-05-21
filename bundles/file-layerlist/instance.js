import React from 'react';
import ReactDOM from 'react-dom';
import { MainPanel, FEATURE_SELECT_ID } from './components/MainPanel';
// unsafe, but the event for filtering features is for some reason in featuredata2 even when the actual handling is in wfsvectorlayerplugin...
import 'oskari-frontend/bundles/framework/featuredata2/event/WFSSetFilter';
import { showPopup } from './components/Popup';
import { Basket } from './basket';
import { processFeatures } from './featureshelper';
import { getLayers } from './layerHelper';

Basket.onChange(updateUI);

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

class FileLayerListBundle extends BasicBundle {
    constructor () {
        super();
        this.__name = 'file-layerlist';
        this.eventHandlers = {
            'AfterMapLayerAddEvent': () => {
                updateUI();
            },
            'AfterMapLayerRemoveEvent': () => {
                updateUI();
            },
            'FeatureEvent': (event) => {
                if (event.getOperation() === 'click') {
                    processFeatures(event.getFeatures(), (features) => {
                        showPopup(features[0]._$coord[0], features[0]._$coord[1], features[0]);
                    });
                }
            },
            'WFSFeaturesSelectedEvent': (event) => {
                const layer = event.getMapLayer();
                const featureValues = layer.getActiveFeatures().filter(feat => {
                    const fid = feat[0];
                    return event.getWfsFeatureIds().includes(fid);
                });
                const matchingFeaturesOnMap = featureValues.map(feat => {
                    const value = {
                        _$layerId: layer.getId()
                    };
                    layer.getFields().forEach((f, index) => {
                        value[f] = feat[index];
                    }); // or getLocales() if present
                    return value;
                });
                processFeatures(matchingFeaturesOnMap, (features) => {
                    const featuresWithFiles = features.filter(feat => feat._$files && feat._$files.length);
                    featuresWithFiles.forEach(feat => { Basket.add(feat); });
                });
            },
            'DrawingEvent': (event) => {
                if (!event.getIsFinished() || event.getId() !== FEATURE_SELECT_ID) {
                    // only interested in finished drawings for attachment selection
                    return;
                }
                Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [FEATURE_SELECT_ID, true, true]);
                Oskari.getSandbox().notifyAll(Oskari.eventBuilder('WFSSetFilter')(event.getGeoJson()));
            }
        };
    }
    _startImpl () {
        updateUI();
    }
}

function updateUI () {
    getLayers((layers) => {
        const selectedLayers = Oskari.getSandbox().getMap().getLayers();
        ReactDOM.render(
            <MainPanel layers={layers} selectedLayers={selectedLayers} />, getRoot());
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
