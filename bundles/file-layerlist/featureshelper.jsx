import React from 'react';
import GeoJSON from 'ol/format/GeoJSON';
// From file-upload bundle
import { LayerHelper } from '../file-upload/service/LayerHelper';
import { FileService } from '../file-upload/service/FileService';
import { Basket } from './basket';

/**
 * Adds internal variables and injects files to features
 * @param {Array} features input features that will be enhanced with file links etc
 * @param {Function} callback returns processed features via callback
 */
export const processFeatures = (features, callback) => {
    const processedFeatures = [];
    // file listing is async so we need to gather results before calling original callback
    const receiveResult = (feat) => {
        processedFeatures.push(feat);
        if (processedFeatures.length === features.length) {
            callback(processedFeatures);
        }
    };
    features
        // normalize features between clicked and mass selection
        .map(feat => {
            const isMassSelection = !feat.geojson;
            if (isMassSelection) {
                // mass selection doesn't include geojson
                return { ...feat };
            }
            // feature was clicked -> read geojson to get coordinates
            const value = {
                _$layerId: feat.layerId,
                ...feat.geojson.features[0].properties
            };
            const coordinates = new GeoJSON().readFeatures(feat.geojson).map(f => f.getGeometry().getFirstCoordinate());
            if (coordinates.length) {
                value._$coord = coordinates[0];
            }
            return value;
        })
        // attach file links when available
        .forEach(feat => addFilesForFeature(feat, receiveResult));
};

function addFilesForFeature (feature, callback) {
    const layerId = feature._$layerId;
    const attachmentFieldName = LayerHelper.getAttachmentIdFieldName(layerId);
    if (!attachmentFieldName) {
        // not found
        callback(feature);
        return;
    }
    const featureId = feature[attachmentFieldName];

    FileService.listFilesForFeature(layerId, featureId, (files) => {
        if (!files.length) {
            // no attachments
            callback(feature);
            return;
        }
        feature._$files = files;
        callback(feature);
    });
};

/**
 * Creates an object data presentation of feature with possible file links
 */
const IGNORED_KEYS = ['_$layerId', '_oid', '__fid', '_$files', '_$coord'];
export const getFeatureElement = (file, addBasketLink = false) => {
    const shownKeys = Object.keys(file)
        .filter(key => !IGNORED_KEYS.includes(key))
        .map(key => (
            <tr key={key}>
                <td>{key}</td>
                <td>{file[key]}</td>
            </tr>));
    // {"external":false,"layerId":2276,"fileExtension":"pdf","id":4,"locale":"TRE 1905198","featureId":"TRE 1905198"}
    shownKeys.push((
        <tr>
            <td colSpan="2">{ getFileLinksForFeature(file._$layerId, file._$files, addBasketLink, file) }</td>
        </tr>));
    return (<table><tbody>{shownKeys}</tbody></table>);
};

function getFileLinksForFeature (layerId, files = [], addBasketLink, item) {
    var url = Oskari.urls.getRoute('WFSAttachments') + `&layerId=${layerId}`;
    const fileLinks = files.map(f => {
        let fileLink = `${url}&fileId=${f.id}`;
        if (f.external) {
            const fileName = encodeURIComponent(f.locale) + '.' + f.fileExtension;
            fileLink = `&featureId=${f.featureId}&name=${fileName}`;
        }
        // eslint-disable-next-line react/jsx-no-target-blank
        return (<a key={fileLink} className="button" target="_blank" rel="noopener noreferer" href={fileLink}>{f.locale}</a>);
    });
    if (addBasketLink && fileLinks.length) {
        fileLinks.push(<a key='basket' className="button" onClick={() => {
            Basket.add(item);
            return false;
        }}>Poimi koriin</a>);
    }
    return fileLinks;
};
