import React from 'react';
import ReactDOM from 'react-dom';
// From file-upload bundle
import { FileService } from '../file-upload/service/FileService';
import { LayerHelper } from '../file-upload/service/LayerHelper';
import { MainPanel, FEATURE_SELECT_ID } from './components/MainPanel';
// unsafe, but the event for filtering features is for some reason in featuredata2 even when the actual handling is in wfsvectorlayerplugin...
import 'oskari-frontend/bundles/framework/featuredata2/event/WFSSetFilter';
import { Basket } from './basket';

const endSelection = () => Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [FEATURE_SELECT_ID, true, true]);
let layers = null;

const selectedFeatures = (features) => {
    console.log('selected features:', features);
    features.forEach(f => showFileListing(f));
};

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');
Oskari.clazz.defineES(
    'Oskari.file-layerlist.BundleInstance',
    class FileLayerListBundle extends BasicBundle {
        constructor () {
            super();
            this.__name = 'file-layerlist';
            this.eventHandlers = {
                'AfterMapLayerAddEvent': () => {
                    render(layers);
                },
                'AfterMapLayerRemoveEvent': () => {
                    render(layers);
                },
                'FeatureEvent': (event) => {
                    if (event.getOperation() === 'click') {
                        console.log('Feature clicked', event);
                        const features = event.getFeatures().map(feat => {
                            const value = {
                                _$layerId: feat.layerId,
                                ...feat.geojson.features[0].properties
                            };
                            return value;
                        });
                        selectedFeatures(features);
                    }
                },
                'WFSFeaturesSelectedEvent': (event) => {
                    // console.log('Feature selected', event);
                    const layer = event.getMapLayer();
                    const featureValues = layer.getActiveFeatures().filter(feat => {
                        const fid = feat[0];
                        return event.getWfsFeatureIds().includes(fid);
                    });
                    const features = featureValues.map(feat => {
                        const value = {
                            _$layerId: layer.getId()
                        };
                        layer.getFields().forEach((f, index) => {
                            value[f] = feat[index];
                        }); // or getLocales() if present
                        return value;
                    });
                    selectedFeatures(features);
                },
                'DrawingEvent': (event) => {
                    if (!event.getIsFinished() || event.getId() !== FEATURE_SELECT_ID) {
                        // only interested in finished drawings for attachment selection
                        return;
                    }
                    endSelection();
                    Oskari.getSandbox().notifyAll(Oskari.eventBuilder('WFSSetFilter')(event.getGeoJson()));
                }
            };
        }
        _startImpl () {
            render([]);
            loadLayers();
        }
    }
);

function loadLayers () {
    if (layers && layers.length) {
        render(layers);
        return;
    }

    const service = Oskari.getSandbox().getService('Oskari.mapframework.service.MapLayerService');
    FileService.listLayersWithFiles(layersJSON => {
        // write to "global"
        layers = layersJSON.map(json => {
            var mapLayer = service.createMapLayer(json);
            // unsupported maplayer type returns null so check for it
            if (mapLayer) {
                service.addLayer(mapLayer);
                return mapLayer;
            }
        }
        // filter out null layers (unsupported)
        ).filter(layer => !!layer);
        // call render
        render(layers);
    }, true);
}

function render (layers) {
    const selectedLayers = Oskari.getSandbox().getMap().getLayers();
    ReactDOM.render(
        <MainPanel layers={layers} selectedLayers={selectedLayers} />, getRoot());
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

function showFileListing (feature) {
    const layerId = feature._$layerId;
    const attachmentFieldName = LayerHelper.getAttachmentIdFieldName(layerId);
    if (!attachmentFieldName) {
        // not found
        return;
    }
    const featureId = feature[attachmentFieldName];

    FileService.listFilesForFeature(layerId, featureId, (files) => {
        if (!files.length) {
            // no attachments
            return;
        }
        feature._$files = files;
        Basket.add(feature);
        render(layers);
    });
}
