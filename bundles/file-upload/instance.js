import React from 'react';
import ReactDOM from 'react-dom';
import { FileUploadPanel } from './components/FileUploadPanel';
import { LayerDetails } from './components/LayerDetails';
import { ProgressBar } from './components/ProgressBar';
import { FileListing } from './components/FileListing';
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
                },
                'GetInfoResultEvent': (event) => {
                    addFileListing(event);
                }
            };
        }
        _startImpl () {
            LayerHelper.setupLayerTools(showFlyout);
        }
    }
);

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
    const featureId = getAttachmentFeatureId(layerId, features);

    FileService.listFilesForFeature(layerId, featureId, (files) => {
        if (!files.length) {
            // no attachments
            return;
        }
        var infoEvent = Oskari.eventBuilder('GetInfoResultEvent')({
            layerId,
            features: [{
                layerId,
                presentationType: 'Sami hack to inject more HTML on GFI popup!',
                content: getFileLinksForFeature(layerId, files)
            }],
            lonlat,
            // just to force "WMS" style parsing
            via: 'ajax'
        });
        eventDetection.push(infoEvent);
        Oskari.getSandbox().notifyAll(infoEvent);
    });
}

function getAttachmentFeatureId (layerId, features) {
    if (features.length !== 1) {
        return;
    }
    const featureProps = features[0];
    const maplayer = LayerHelper.getLayerService().findMapLayer(layerId);
    const featureMappingField = 'lehtinro';
    // -> maplayer.getAttributes('attachmentKey') || 'id'
    const fieldIndex = maplayer.getFields().indexOf(featureMappingField);
    return featureProps[fieldIndex];
}

function getFileLinksForFeature (layerId, files) {
    // TODO: bind FileService.openFile(layerId, f.id)
    const html = files.map(f => `<a class="button" target="_blank" rel="noopener noreferer" href="https://google.fi">${f.locale}</a>`);
    return `<div>
        <b>Tiedostot:</b> ${html.join(' ')}
    </div>`;
}

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
      <FileListing files={layer.files || []} />
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
