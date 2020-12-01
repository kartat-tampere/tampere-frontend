import React from 'react';
import { Tooltip } from 'oskari-ui';
import PropTypes from 'prop-types';

const propsAsList = (properties) => {
    const keys = Object.keys(properties);
    return (<ul>
        { keys.map(prop => <li key={prop}>{ prop }: { properties[prop] }</li>)}
    </ul>);
};

export const Feature = ({ feature }) => {
    const title = propsAsList(feature.properties);
    return (<li>
        <Tooltip placement="left" title={ title }>{ feature.id }</Tooltip>
    </li>);
};

Feature.propTypes = {
    feature: PropTypes.object.isRequired
};
