import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Message } from 'oskari-ui';
import { addFeaturesToMap, clearFeaturesFromLayer } from '../service/featuresHelper';

const LAYER_ID = 'SourceMaterialSelection';

export const Selection = ({ feature }) => {
    if (!feature) {
        clearFeaturesFromLayer(LAYER_ID);
        return (<Message messageKey='layerSelection.noSelection' />);
    }

    const onChange = (checked) => {
        if (checked) {
            addFeaturesToMap(feature, {
                layerId: LAYER_ID,
                centerTo: true
            });
        } else {
            clearFeaturesFromLayer(LAYER_ID);
        }
    };

    return (<div>
        <Switch onChange={onChange}/> <Message messageKey='layerSelection.showSelection' />
        <br /><br />
    </div>);
};

Selection.propTypes = {
    feature: PropTypes.object
};
