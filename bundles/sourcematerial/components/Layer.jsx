import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const Layer = ({ service, layer, bbox }) => {
    return (<li>
        { Oskari.getLocalized(layer.name) }
    </li>);
};

Layer.propTypes = {
    service: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    bbox: PropTypes.array
};
