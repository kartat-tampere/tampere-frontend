import React from 'react';
import PropTypes from 'prop-types';
import { Basket } from '../basket';
import styled from 'styled-components';
import { Button } from 'antd';
import { CloudDownloadOutlined, FileAddOutlined } from '@ant-design/icons';

const LinkButton = styled(Button)`
    margin-right: 5px;
`;

export const FileLink = ({ link, children }) => {
    return (<LinkButton size={'small'} onClick={() => {
            window.open(link, '_blank');
            return false;
        }}>
            <CloudDownloadOutlined />{ children }
    </LinkButton>);
};
FileLink.propTypes = {
    link: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired
};

export const BasketLink = ({ item }) => {
    return (<LinkButton size={'small'} onClick={() => {
        Basket.add(item);
        return false;
    }}>
        <FileAddOutlined />
        Poimi koriin
    </LinkButton>);
};

BasketLink.propTypes = {
    item: PropTypes.any.isRequired
};

// {"external":false,"layerId":2276,"fileExtension":"pdf","id":4,"locale":"TRE 1905198","featureId":"TRE 1905198"}
export const getFileLinksForFeature = (layerId, files = [], addBasketLink, item) => {
    var url = Oskari.urls.getRoute('WFSAttachments') + `&layerId=${layerId}`;
    const fileLinks = files.map(f => {
        let fileLink = `${url}&fileId=${f.id}`;
        if (f.external) {
            const fileName = encodeURIComponent(f.locale) + '.' + f.fileExtension;
            fileLink = `&featureId=${f.featureId}&name=${fileName}`;
        }
        // eslint-disable-next-line react/jsx-no-target-blank
        return (<FileLink key={fileLink} link={fileLink}>{f.locale}</FileLink>);
    });

    if (addBasketLink && fileLinks.length) {
        fileLinks.push(<BasketLink key='basket' item={item} />);
    }
    return fileLinks;
};
