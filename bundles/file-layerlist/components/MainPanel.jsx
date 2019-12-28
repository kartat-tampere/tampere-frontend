import React, { useState } from 'react';
import { Drawer, Button } from 'antd';
import 'antd/es/button/style/index.js';
import 'antd/es/drawer/style/index.js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LayerSelect } from './LayerSelect';

const StyledRootEl = styled('div')`
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 50;
`;

export const MainPanel = ({ layers = [], selectedLayers = [] }) => {
    const [visible, setVisible] = useState(false);
    const isSelected = (layer) => {
        return selectedLayers.some(l => l.getId() === layer.getId());
    };
    const hasLayers = layers.length > 0;
    return (
        <React.Fragment>
            <StyledRootEl>
                <Button type="primary" onClick={() => setVisible(!visible)}>
                    Valitse aineisto
                </Button>
            </StyledRootEl>
            <Drawer
                title="Ladattavat aineistot"
                placement={'left'}
                closable={true}
                onClose={() => setVisible(false)}
                visible={visible}
            >
                { !hasLayers &&
                <b>Ei ladattavia aineistoja</b>
                }

                { layers.map(layer =>
                    <LayerSelect
                        key={layer.getId() + isSelected(layer)}
                        layer={layer}
                        isSelected={isSelected(layer)} />) }
            </Drawer>
        </React.Fragment>
    );
};

MainPanel.propTypes = {
    layers: PropTypes.any,
    selectedLayers: PropTypes.any
};
