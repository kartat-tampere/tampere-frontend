import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { LayerHelper } from '../../file-upload/service/LayerHelper';
import { getLayerFromService } from '../helpers/layerHelper';

export const BasketContent = ({ contents = [], onRemove }) => {
    const layers = groupByLayer(contents);
    return (
        <React.Fragment>
            { Object.keys(layers).map(layerId => <LayerItems key={layerId} layer={layers[layerId]} onRemove={onRemove} />) }
        </React.Fragment>
    );
};

BasketContent.propTypes = {
    contents: PropTypes.any,
    onRemove: PropTypes.func.isRequired
};
const IconContainer = styled('div')`
    float: right;
`;
const RemoveIcon = ({ item, onRemove }) => {
    return (<IconContainer><DeleteTwoTone twoToneColor="#FF0000" onClick={() => onRemove(item)}/></IconContainer>);
};
const Feature = ({ item, idField, onRemove }) => {
    return (<li>
        <b>{item[idField]}</b><RemoveIcon item={item} onRemove={onRemove} />
        <br />
        <Button>Link 1</Button>
        <Button>Link 2</Button>
    </li>);
};

const LayerItems = ({ layer, onRemove }) => {
    return (
        <React.Fragment>
            <h4>{ layer.name }</h4>
            <div>{ layer.idField }</div>
            <ul>
                { layer.features.map(item => (
                    <Feature key={item[layer.idField]} item={item} idField={layer.idField} onRemove={onRemove} />
                )) }
            </ul>
        </React.Fragment>
    );
};
LayerItems.propTypes = {
    layer: PropTypes.any.isRequired,
    onRemove: PropTypes.func.isRequired
};

// (contents: object with keys like {_$layerId, DIAARINRO, DOKUMENTIT, _oid, _$coord, _$files}).
const groupByLayer = (contents) => {
    const value = {};
    contents.forEach(item => {
        const layer = item._$layerId;
        if (!value[layer]) {
            const attachmentFieldName = LayerHelper.getAttachmentIdFieldName(layer);
            const layerItem = getLayerFromService(layer);
            value[layer] = {
                idField: attachmentFieldName,
                name: layerItem.getName(),
                features: []
            };
        }
        value[layer].features.push(item);
    });
    return value;
};