import React, { useEffect } from 'react';
import { Spin, Switch, Message } from 'oskari-ui';
import { addFeaturesToMap, clearFeaturesFromLayer } from '../service/featuresHelper';
import PropTypes from 'prop-types';

const LAYER_ID = 'SourceMaterialFeatures_';

export const Layer = ({ layerState, bbox }) => {
    const { loading, layer, features } = layerState;
    const layerId = LAYER_ID + layer.id;

    useEffect(() => {
        // Specify how to clean up after this unmounts
        return function cleanup () {
            clearFeaturesFromLayer(layerId);
        };
    });
    const onChange = (checked) => {
        if (checked) {
            addFeaturesToMap(features, {
                layerId: layerId
            });
        } else {
            clearFeaturesFromLayer(layerId);
        }
    };
    return (<li>
        <b>{ Oskari.getLocalized(layer.name) }</b><br />
        { loading &&
            <React.Fragment>
                <Spin /><Message messageKey='layer.loading' />
            </React.Fragment> }
        { bbox && !loading && !features &&
            <Message messageKey='layer.errorLoading' /> }
        { features &&
            <React.Fragment>
                <Switch onChange={onChange} disabled={!features.length}/> <Message messageKey='layer.showFeatures' /> ({ features.length })
            </React.Fragment>}
    </li>);
};

Layer.propTypes = {
    service: PropTypes.object.isRequired,
    layerState: PropTypes.object.isRequired,
    bbox: PropTypes.array
};
