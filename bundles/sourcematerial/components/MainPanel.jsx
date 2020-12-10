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

const getBBOX = (feature) => {
    if (!feature) {
        return null;
    }

    const coords = feature.geometry.coordinates[0];
    const bbox = coords[0].concat(coords[3]);
    return bbox;
};

export const MainPanel = ({ service, selectionFeature, drawControl, isDrawing }) => {
    const roles = service.getRoles();
    const [layerSelectVisible, showLayerSelect] = useState(true);
    const [currentRole, setRole] = useState(roles[0]);
    let layers = service.getLayers(currentRole);

    const changeRole = (role) => {
        setRole(role);
        layers = service.getLayers(role);
    };

    const bbox = getBBOX(selectionFeature);

    const hasLayers = layers.length > 0;
    return (
        <React.Fragment>
            <StyledRootEl>
                <Radio.Group value={currentRole} style={{ float: 'left' }} onChange={(evt) => changeRole(evt.target.value)}>
                    { roles.map(role => (<Radio.Button key={role} style={{ display: 'block' }} value={role}>{ role }</Radio.Button>)) }
                </Radio.Group>
                <Button onClick={drawControl}>
                    { isDrawing ? <Message messageKey='buttons.endDraw' /> : <Message messageKey='buttons.drawSelection' /> }
                </Button>
                <Badge count={layers.length}>
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
                    { layers.map(layer => (
                        <Layer
                            key={layer.id}
                            layer={layer}
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
    selectionFeature: PropTypes.object,
    isDrawing: PropTypes.bool
};
