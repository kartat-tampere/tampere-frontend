import React, { useState } from 'react';
import { Spin, Switch, Message } from 'oskari-ui';
import { addFeaturesToMap, clearFeaturesFromLayer } from '../service/featuresHelper';
import PropTypes from 'prop-types';

const LAYER_ID = 'SourceMaterialFeatures_';

export const Layer = ({ service, layer, bbox }) => {
    const bboxString = bbox && bbox.join();
    const [loadStatus, setLoadingStatus] = useState({
        bbox: bboxString,
        loading: false,
        features: null,
        error: null
    });
    const requiresLoading = bbox && bboxString !== loadStatus.bbox;
    const requiresReset = !bbox && loadStatus.bbox;
    if (requiresReset) {
        setLoadingStatus({
            bbox: undefined,
            loading: false,
            features: null,
            error: null
        });
    } else if (!loadStatus.loading && requiresLoading) {
        setLoadingStatus({
            bbox: bboxString,
            loading: true,
            features: null,
            error: null
        });
        service.getFeatures(bboxString, layer.id, (result) => {
            if (!result) {
                // TODO: error handling
                setLoadingStatus({
                    bbox: bboxString,
                    loading: false,
                    features: null,
                    error: true
                });
                return;
            }
            setLoadingStatus({
                bbox: bboxString,
                loading: false,
                features: result.features,
                error: null
            });
        });
    }
    const layerId = LAYER_ID + layer.id;

    const onChange = (checked) => {
        if (checked) {
            addFeaturesToMap(loadStatus.features, {
                layerId: layerId
            });
        } else {
            clearFeaturesFromLayer(layerId);
        }
    };
    return (<li>
        <b>{ Oskari.getLocalized(layer.name) }</b><br />
        { loadStatus.loading &&
            <React.Fragment>
                <Spin /><Message messageKey='layer.errorLoading' />
            </React.Fragment> }
        { loadStatus.loading &&
            <Message messageKey='layer.errorLoading' /> }
        { loadStatus.features &&
            <React.Fragment>
                <Switch onChange={onChange}/> <Message messageKey='layer.showFeatures' /> ({ loadStatus.features.length })
            </React.Fragment>}
    </li>);
};

Layer.propTypes = {
    service: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    bbox: PropTypes.array
};
