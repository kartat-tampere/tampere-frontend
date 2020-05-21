import React from 'react';
import { Messaging } from 'oskari-ui/util';
import { getFeatureElement } from './featureshelper';

const getFileId = (file) => {
    return file._$layerId + '||' + (file._oid || file.__fid);
};
export const showMessage = (file) => {
    Messaging.open({
        title: 'Ladattava kohde',
        content: (<table><tbody>{getFeatureElement(file)}</tbody></table>)
    });
};

const selectedFiles = {};
const listeners = [];
const notify = () => {
    listeners.forEach(l => l());
};

export const Basket = {
    add: (file) => {
        selectedFiles[getFileId(file)] = file;
        notify();
    },
    list: () => Object.values(selectedFiles),
    remove: (file) => {
        delete selectedFiles[getFileId(file)];
        notify();
    },
    onChange: (listener) => listeners.push(listener)
};
