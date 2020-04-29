import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledRootEl = styled('div')`
    margin: 5px;
    padding: 10px;
    border: 1px solid black;
    border-radius: 5px;
    background: ${props => props.selected ? '#1890ff' : 'white'};
    color: ${props => props.selected ? 'white' : '#1890ff'};
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
        <StyledRootEl selected={isSelected} onClick={() => handleClick(layer, isSelected)}>
            { layer.getName() }
        </StyledRootEl>
    );
};

LayerSelect.propTypes = {
    layer: PropTypes.object.isRequired,
    isSelected: PropTypes.bool
};
