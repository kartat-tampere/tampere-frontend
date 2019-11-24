import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledRootEl = styled('div')`
    margin: 10px;
    border: 1px solid black;
`;

function handleClick (layer, isSelected) {
    if (isSelected) {
        Oskari.getSandbox().postRequestByName('RemoveMapLayerRequest', [layer.getId()]);
    } else {
        Oskari.getSandbox().postRequestByName('AddMapLayerRequest', [layer.getId()]);
    }
}

export const LayerSelect = ({ layer, isSelected = false }) => {
    return (
        <StyledRootEl onClick={() => handleClick(layer, isSelected)}>
            { layer.getName() } ({ '' + isSelected })
        </StyledRootEl>
    );
};

LayerSelect.propTypes = {
    layer: PropTypes.object.isRequired,
    isSelected: PropTypes.bool
};
