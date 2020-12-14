import React, { useState } from 'react';
import { Drawer, Button, Badge, Radio } from 'antd';
import 'antd/es/radio/style/index.js';
import 'antd/es/button/style/index.js';
import 'antd/es/drawer/style/index.js';
import 'antd/es/tooltip/style/index.js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Message } from 'oskari-ui';
import { Layer } from './Layer';
import { Selection } from './Selection';

const StyledRootEl = styled('div')`
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 50;
    > button {
        margin-right: 10px;
    }
`;

export const MainPanel = ({ service, state, drawControl, isDrawing }) => {
    const selectionFeature = state.currentSelection;
    const bbox = state.bbox;
    const roles = state.roles;
    const [layerSelectVisible, showLayerSelect] = useState(true);
    const currentRole = state.currentRole;
    const layersState = state.layers;

    const changeRole = (role) => {
        service.setCurrentRole(role);
    };

    const hasLayers = layersState.length > 0;
    return (
        <React.Fragment>
            <StyledRootEl>
                <Radio.Group value={currentRole} style={{ float: 'left' }} onChange={(evt) => changeRole(evt.target.value)}>
                    { roles.map(role => (<Radio.Button key={role} style={{ display: 'block' }} value={role}>{ role }</Radio.Button>)) }
                </Radio.Group>
                <Button onClick={drawControl}>
                    { isDrawing ? <Message messageKey='buttons.endDraw' /> : <Message messageKey='buttons.drawSelection' /> }
                </Button>
                <Badge count={layersState.length}>
                    <Button type="primary" onClick={() => showLayerSelect(!layerSelectVisible)}>
                        <Message messageKey='buttons.layerSelection' />
                    </Button>
                </Badge>
            </StyledRootEl>
            <Drawer
                title={<Message messageKey='layerSelection.title' />}
                placement={'right'}
                closable={true}
                mask={false}
                onClose={() => showLayerSelect(false)}
                visible={layerSelectVisible}
            >
                <Selection feature={selectionFeature} />

                { !hasLayers &&
                <b><Message messageKey='noLayersWithFiles' /></b>
                }
                <ul style={{ listStyleType: 'none' }}>
                    { layersState.map(layerState => (
                        <Layer
                            key={layerState.layer.id}
                            layerState={layerState}
                            bbox={bbox}
                            service={service} />)) }
                </ul>
            </Drawer>
        </React.Fragment>
    );
};

MainPanel.propTypes = {
    service: PropTypes.object.isRequired,
    drawControl: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
    isDrawing: PropTypes.bool
};
