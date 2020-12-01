import React, { useState } from 'react';
import { Spin } from 'oskari-ui';
import PropTypes from 'prop-types';
import { Feature } from './Feature';

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
    return (<li>
        <b>{ Oskari.getLocalized(layer.name) }</b><br />
        { loadStatus.loading && <Spin /> }
        <ul>
            { loadStatus.loading && <li>error</li> }
            { loadStatus.features && loadStatus.features
                .map(f => (<Feature key={f.id} feature={f} />)) }
        </ul>
    </li>);
};

Layer.propTypes = {
    service: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    bbox: PropTypes.array
};
