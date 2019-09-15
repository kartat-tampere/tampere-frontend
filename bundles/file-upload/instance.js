import React from 'react';
import ReactDOM from 'react-dom';
import { FileUploadPanel } from './components/FileUploadPanel';
import { LayerDetails } from './components/LayerDetails';
import { ProgressBar } from './components/ProgressBar';
import { FileService } from './service/FileService';
import { LayerHelper } from './service/LayerHelper';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');
const flyout = Oskari.clazz.create(
    'Oskari.userinterface.extension.ExtraFlyout',
    'Lisää tiedostoja'
);
flyout.move(170, 0, true);
flyout.makeDraggable();
const mainUI = jQuery('<div></div>');
flyout.setContent(mainUI);

let layer = {};

Oskari.clazz.defineES(
    'Oskari.file-upload.BundleInstance',
    class FileUploadBundle extends BasicBundle {
        constructor () {
            super();
            this.__name = 'file-upload';
            this.eventHandlers = {
                'MapLayerEvent': (event) => {
                    if (event.getOperation() !== 'add') {
                        // only handle add layer
                        return;
                    }
                    if (event.getLayerId()) {
                        LayerHelper.addLayerTool(event.getLayerId(), showFlyout);
                    } else { // initial layer load
                        LayerHelper.setupLayerTools(showFlyout);
                    }
                }
            };
        }
        _startImpl () {
            LayerHelper.setupLayerTools(showFlyout);
            /*
            listLayersWithFiles((msg) => alert(`List of layers ${msg}`));
            listFilesForLayer(layer.id, (msg) => alert(`List of files ${JSON.stringify(msg)}`));
            listFilesForFeature(layer.id, '2019-06-03', (msg) => alert(`List of files for feature ${JSON.stringify(msg)}`));
            openFile(layer.id, 16);
            */
        }
    }
);

function showFlyout (layerId) {
    const maplayer = LayerHelper.getLayerService().findMapLayer(layerId);
    layer = {
        id: maplayer.getId(),
        name: maplayer.getName(),
        attr: maplayer.getAttributes('attachmentKey') || 'id'
    };
    FileService.listFilesForLayer(layer.id, function (files) {
        layer = {
            files,
            ...layer
        };
        updateUI(layer);
    });
    flyout.show();
    updateUI(layer);
}

function updateUI (layer, progress) {
    ReactDOM.render(
    <>
      <LayerDetails
          {...layer}
          onPropertyChange={value => changeLayerAttr(value)}
      />
      <FileUploadPanel onSubmit={submitFiles} />
      <ProgressBar value={progress || 0} />
    </>,
    mainUI[0]);
}

function changeLayerAttr (value) {
    layer.attr = value;
    updateUI(layer);
}

function submitFiles (data, resetCB = () => {}) {
    FileService.uploadFiles(
        layer.id,
        data.files,
        (progress) => updateUI(layer, progress),
        () => {
            alert('Tiedostot lisätty');
            resetCB();
        },
        () => {
            updateUI(layer, 0);
            alert('Virhe tiedostojen siirrossa');
        });
}
