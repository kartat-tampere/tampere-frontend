import React from 'react';
import ReactDOM from 'react-dom';
import { FileUploadPanel } from './components/FileUploadPanel';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

Oskari.clazz.defineES('Oskari.file-upload.BundleInstance',
    class FileUploadBundle extends BasicBundle {
        constructor () {
            super();
            this.__name = 'file-upload';
        }
        _startImpl () {
            const root = document.getElementById('loginbar');
            if (!root) {
                alert('prob');
            }

            var flyout = Oskari.clazz.create('Oskari.userinterface.extension.ExtraFlyout', 'File upload');
            flyout.show();
            flyout.move(170, 0, true);
            flyout.makeDraggable();

            var mainUI = jQuery('<div></div>');
            ReactDOM.render(<FileUploadPanel />, mainUI[0]);
            flyout.setContent(mainUI);
        }
    }
);
