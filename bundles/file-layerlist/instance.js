import React from 'react';
import ReactDOM from 'react-dom';
// From file-upload bundle
import { FileService } from '../file-upload/service/FileService';
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