import React from 'react';
import ReactDOM from 'react-dom';
// From file-upload bundle
import { FileService } from '../file-upload/service/FileService';
import { LayerHelper } from '../file-upload/service/LayerHelper';
import { MainPanel } from './components/MainPanel';
let layers = null;

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
                'GetInfoResultEvent': (event) => {
                    addFileListing(event);
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

    var service = Oskari.getSandbox().getService(
        'Oskari.mapframework.service.MapLayerService');
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

let eventDetection = [];

function addFileListing (gfiResultEvent) {
    // Hacky way of detecting if we sent this...
    var filtered = eventDetection.filter(e => e !== gfiResultEvent);
    if (filtered.length !== eventDetection.length) {
        // remove from detection
        eventDetection = filtered;
        // Don't react again
        return;
    }
    // Nope, all good, not going to infinity and beyond!
    var { layerId, features, lonlat } = gfiResultEvent.getData();
    const featureId = LayerHelper.getAttachmentFeatureId(layerId, features);
    if (!featureId) {
        // not found
        return;
    }

    FileService.listFilesForFeature(layerId, featureId, (files) => {
        if (!files.length) {
            // no attachments
            return;
        }
        var infoEvent = Oskari.eventBuilder('GetInfoResultEvent')({
            layerId,
            features: [{
                layerId,
                presentationType: 'Hack to inject more HTML on GFI popup!',
                content: FileService.getFileLinksForFeature(layerId, files)
            }],
            lonlat,
            // just to force "WMS" style parsing
            via: 'ajax'
        });
        eventDetection.push(infoEvent);
        Oskari.getSandbox().notifyAll(infoEvent);
    });
}
