import React, { useState } from 'react';
import { Drawer, Button, Badge, Tooltip } from 'antd';
import 'antd/es/button/style/index.js';
import 'antd/es/drawer/style/index.js';
import 'antd/es/tooltip/style/index.js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LayerSelect } from './LayerSelect';
import { BasketContent, RemoveAllIcon } from './BasketContent';
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
    const fileLayerSelected = layers.some(isSelected);
    const hasSelections = Basket.list().length > 0;
    if (basketVisible && !hasSelections) {
        // in case remove all was clicked on basket
        showBasket(false);
    }
    return (
        <React.Fragment>
            <StyledRootEl>
                <Button type="primary" onClick={() => showLayerSelect(!layerSelectVisible)}>
                    Aineistot
                </Button>
                <Button onClick={startSelection} disabled={!fileLayerSelected}>
                    Valitse piirtämällä
                </Button>
                <Badge count={Basket.list().length}>
                    <Button onClick={() => showBasket(!basketVisible)} disabled={!hasSelections}>
                        Tiedostot
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
                title={<BasketTitle />}
                placement={'right'}
                closable={true}
                onClose={() => showBasket(false)}
                width={350}
                visible={basketVisible} >
                <BasketContent
                    contents={Basket.list()}
                    onRemove={(item) => Basket.remove(item) }/>
            </Drawer>
        </React.Fragment>
    );
};

const BasketTitle = () => (
    <React.Fragment>
        Valitut kohteet <Tooltip placement="bottom" title="Poista kaikki"><span><RemoveAllIcon /></span></Tooltip>
    </React.Fragment>
);

MainPanel.propTypes = {
    layers: PropTypes.any,
    selectedLayers: PropTypes.any
};
