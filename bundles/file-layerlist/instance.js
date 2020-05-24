import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging } from 'oskari-ui/util';
import { MainPanel, FEATURE_SELECT_ID } from './components/MainPanel';
import { showPopup, hidePopup } from './components/Popup';
import { Basket } from './basket';
import { processFeatures } from './helpers/featureshelper';
import { getLayers, getLayerFromService } from './helpers/layerHelper';
import { getFeaturesInGeom } from './helpers/geomSelector';

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
                // TODO: listen to event for removing stuff from basket?
            },
            'DrawingEvent': (event) => {
                if (!event.getIsFinished() || event.getId() !== FEATURE_SELECT_ID) {
                    // only interested in finished drawings for attachment selection
                    return;
                }
                Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [FEATURE_SELECT_ID, true, true]);
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
                        Messaging.success('Valitut kohteet lisätty koriin');
                    } else {
                        Messaging.warn('Valintaan ei osunut yhtään tiedostoja sisältävää kohdetta');
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
    const features = Basket.list();
    const WFSLayerService = Oskari.getSandbox().getService('Oskari.mapframework.bundle.mapwfs2.service.WFSLayerService');
    try {
        WFSLayerService.emptyAllWFSFeatureSelections();
    } catch (ignored) {
        // this crashes if something was removed from basket after layer was removed from map
    }
    if (!features.length) {
        return;
    }
    const layer = getLayerFromService(features[0]._$layerId);
    if (!layer) {
        return;
    }
    const featureIds = features.map(f => f._oid);
    // service needs to be called in addition to sending event
    // FIXME: IN MAPWFS2 and FEATUREDATA2!!
    WFSLayerService.setWFSFeaturesSelections(layer.getId(), featureIds);
    // TODO: group by layer etc
    var event = Oskari.eventBuilder('WFSFeaturesSelectedEvent')(featureIds, layer);
    Oskari.getSandbox().notifyAll(event);
}

function updateUI () {
    getLayers((layers) => {
        // hide any possibly open popups on map before re-render (in case layer was removed etc)
        hidePopup();
        // update highlighted features based on basket content
        highlightFeatures();
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
