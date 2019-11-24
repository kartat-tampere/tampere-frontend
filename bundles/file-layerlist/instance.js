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
                'MapLayerEvent': (event) => {
                    const op = event.getOperation();
                    if (op !== 'add') {
                        return;
                    }
                    loadLayers();
                },
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
    FileService.listLayersWithFiles(layersIds => {
        layers = layersIds.map(id =>
            service.findMapLayer(id)
        ).filter(layer => !!layer);
        render(layers);
    });
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
