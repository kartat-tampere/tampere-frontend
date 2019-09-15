import React from 'react';
import PropTypes from 'prop-types';

export const FileListing = ({ files }) => {
    return (
        <div>
            <h4>Tiedostot:</h4>
            <ul>
                {files && files.map(f => (
                    <li key={f.id}>ID: {f.featureId} / Label: {f.locale}</li>
                ))}
                {!files.length && (<li>Ei tiedostoja</li>) }
            </ul>
        </div>
    );
};

FileListing.propTypes = {
    files: PropTypes.any
};
