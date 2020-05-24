import React, { useState } from 'react';
import { Drawer, Button, Badge } from 'antd';
import 'antd/es/button/style/index.js';
import 'antd/es/drawer/style/index.js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LayerSelect } from './LayerSelect';
import { BasketContent } from './BasketContent';
import { Basket } from '../basket';

const StyledRootEl = styled('div')`
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 50;
    > button {
        margin-right: 10px;
    }
`;
export const FEATURE_SELECT_ID = 'attachmentSelection';
const startSelection = () => Oskari.getSandbox().postRequestByName('DrawTools.StartDrawingRequest', [FEATURE_SELECT_ID, 'Polygon']);

export const MainPanel = ({ layers = [], selectedLayers = [] }) => {
    const [layerSelectVisible, showLayerSelect] = useState(false);
    const [basketVisible, showBasket] = useState(false);
    const isSelected = (layer) => {
        return selectedLayers.some(l => l.getId() === layer.getId());
    };
    const hasLayers = layers.length > 0;
    const hasSelections = Basket.list().length > 0;
    return (
        <React.Fragment>
            <StyledRootEl>
                <Button type="primary" onClick={() => showLayerSelect(!layerSelectVisible)}>
                    Valitse aineisto
                </Button>
                <Button onClick={startSelection}>
                    Massavalinta
                </Button>
                <Badge count={Basket.list().length}>
                    <Button onClick={() => showBasket(!basketVisible)} disabled={!hasSelections}>
                        Ostoskori
                    </Button>
                </Badge>
            </StyledRootEl>
            <Drawer
                title="Ladattavat aineistot"
                placement={'left'}
                closable={true}
                onClose={() => showLayerSelect(false)}
                visible={layerSelectVisible}
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
            <Drawer
                title="Valitut kohteet"
                placement={'right'}
                closable={true}
                onClose={() => showBasket(false)}
                // width='50%'
                visible={basketVisible} >
                <BasketContent contents={Basket.list()} onRemove={(item) => Basket.remove(item) }/>
            </Drawer>
        </React.Fragment>
    );
};

MainPanel.propTypes = {
    layers: PropTypes.any,
    selectedLayers: PropTypes.any
};
