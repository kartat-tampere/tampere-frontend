import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging, LocaleProvider } from 'oskari-ui/util';
import { MainPanel } from './components/MainPanel';
import { getService } from './service/layerservice';

const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

const SOURCEMATERIAL_ID = 'sourcematerial';
let isDrawing = false;
let currentSelection;
const startDrawSelection = () => {
    currentSelection = null;
    Oskari.getSandbox().postRequestByName('DrawTools.StartDrawingRequest', [SOURCEMATERIAL_ID, 'Box']);
    isDrawing = true;
    updateUI();
};
const endDrawSelection = () => {
    Oskari.getSandbox().postRequestByName('DrawTools.StopDrawingRequest', [SOURCEMATERIAL_ID, true, true]);
    isDrawing = false;
    updateUI();
};
const toggleDrawing = () => {
    isDrawing ? endDrawSelection() : startDrawSelection();
};

const loc = Oskari.getMsg.bind(null, SOURCEMATERIAL_ID);
class SourceMaterialBundle extends BasicBundle {
    constructor () {
        super();
        this.__name = SOURCEMATERIAL_ID;
        this.loc = loc;
        this.eventHandlers = {
            DrawingEvent: (event) => {
                if (!event.getIsFinished() || event.getId() !== SOURCEMATERIAL_ID) {
                    // only interested in finished drawings for attachment selection
                    return;
                }
                console.log(JSON.stringify(event.getGeoJson()));
                currentSelection = event.getGeoJson().features[0];
                endDrawSelection();
            }
        };
    }

    _startImpl () {
        updateUI();
    }
}

function updateUI () {
    getService((service) => {
        const hasAccess = service.getRoles().length > 0;
        if (!hasAccess) {
            Messaging.error(loc('accessdenied'));
            return;
        }
        ReactDOM.render(
            <LocaleProvider value={{ bundleKey: SOURCEMATERIAL_ID }}>
                <MainPanel service={service}
                    drawControl={toggleDrawing}
                    isDrawing={isDrawing}
                    selectionFeature={currentSelection} />
            </LocaleProvider>, getRoot());
    });
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

// so bundle.js can reference this
Oskari.clazz.defineES('Oskari.sourcematerial.BundleInstance', SourceMaterialBundle);
