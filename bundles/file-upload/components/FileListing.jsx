import React from 'react';
import PropTypes from 'prop-types';

const getListing = (files) => {
    const model = {};
    files.forEach(element => {
        let feature = model[element.featureId] || { 
            id: element.featureId,
            files: []
        };
        feature.files.push(element);
        model[element.featureId] = feature;
    });
    return Object.values(model);
};
export const FileListing = ({ files = [], onDelete = () => {} }) => {
    const model = getListing(files);
    return (
        <div>
            <h4>Tiedostot:</h4>
            <ul>
                {model.map(f => (
                    <FeatureItem 
                        key={f.id + f.files.map(m => m.id).join('_')} 
                        feature={f} 
                        onDelete={onDelete} />
                ))}
                {!model.length && (<li>Ei tiedostoja</li>) }
            </ul>
        </div>
    );
};

const FeatureItem = ({feature, onDelete}) => {
    return (
        <li>
            <b>Feature: {feature.id}</b>
            <div>Tiedostot: 
                {feature.files.map(f => (
                    <FileItem 
                        key={f.id}
                        file={f}
                        onDelete={onDelete} />
                ))}
            </div>
        </li>
    );
};

const FileItem = ({file, onDelete}) => {
    return (
        <input type="button" 
            onClick={() => onDelete(file.layerId, file.id)}
            value={file.locale} />
    );
};

FileListing.propTypes = {
    files: PropTypes.any,
    onDelete: PropTypes.func
};
