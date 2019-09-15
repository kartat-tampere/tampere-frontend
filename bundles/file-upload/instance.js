import React from 'react';
import ReactDOM from 'react-dom';
import { FileUploadPanel } from './components/FileUploadPanel';
import { LayerDetails } from './components/LayerDetails';
import { ProgressBar } from './components/ProgressBar';
import { uploadFiles,
    listLayersWithFiles,
    listFilesForLayer,
    listFilesForFeature,
    openFile } from './service/FileService';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');
let mainUI = jQuery('<div></div>');

const layer = {
    id: 1,
    name: 'Moi',
    attr: 'id'
};

Oskari.clazz.defineES(
    'Oskari.file-upload.BundleInstance',
    class FileUploadBundle extends BasicBundle {
        constructor () {
            super();
            this.__name = 'file-upload';
        }
        _startImpl () {
            var flyout = Oskari.clazz.create(
                'Oskari.userinterface.extension.ExtraFlyout',
                'Lisää tiedostoja'
            );
            flyout.show();
            flyout.move(170, 0, true);
            flyout.makeDraggable();
            update(layer);
            flyout.setContent(mainUI);
            /*
            listLayersWithFiles((msg) => alert(`List of layers ${msg}`));
            listFilesForLayer(layer.id, (msg) => alert(`List of files ${JSON.stringify(msg)}`));
            listFilesForFeature(layer.id, '2019-06-03', (msg) => alert(`List of files for feature ${JSON.stringify(msg)}`));
            openFile(layer.id, 16);
            */
        }
    }
);

function update (layer, progress) {
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
    update(layer);
}

function submitFiles (data, resetCB = () => {}) {
    uploadFiles(
        layer.id,
        data.files,
        (progress) => update(layer, progress),
        () => {
            alert('Tiedostot lisätty');
            resetCB();
        },
        () => alert('Virhe tiedostojen siirrossa'));
}
