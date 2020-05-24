import React from 'react';
import ReactDOM from 'react-dom';
import Overlay from 'ol/Overlay';
import './Popup.css';
import { ObjectData } from './ObjectData';

let overlay;

export const hidePopup = () => {
    overlay && overlay.setPosition(undefined);
    const closer = document.getElementById('popup-closer');
    closer && closer.blur();
    return false;
};

const addMapOverlay = () => {
    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
    ReactDOM.render(<div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
    </div>, wrapper);

    overlay = new Overlay({
        element: document.getElementById('popup'),
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    const olMap = Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule').getMap();
    olMap.addOverlay(overlay);
};

export const showPopup = (x, y, content) => {
    if (!overlay) {
        addMapOverlay();
    }
    const el = document.getElementById('popup-content');
    ReactDOM.render(<ObjectData item={content} addBasketLink={true} />, el);
    overlay.setPosition([x, y]);
    const closeBtn = document.getElementById('popup-closer');
    if (!closeBtn.onclick) {
        closeBtn.onclick = hidePopup;
    }
};
