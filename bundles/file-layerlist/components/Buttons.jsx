import React from 'react';
import PropTypes from 'prop-types';
import { Basket } from '../basket';
import styled from 'styled-components';
import { Button } from 'antd';
import { CloudDownloadOutlined, FileAddTwoTone } from '@ant-design/icons';

const LinkButton = styled(Button)`
    margin-right: 5px;
`;

export const FileLink = ({ link, children }) => {
    return (<LinkButton size="small" onClick={() => {
        window.open(link, '_blank');
        return false;
    }}>
        <CloudDownloadOutlined style={{ color: '#096DD9' }} />{ children }
    </LinkButton>);
};
FileLink.propTypes = {
    link: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired
};

export const BasketLink = ({ item }) => {
    return (<LinkButton size="small" onClick={() => {
        Basket.add(item);
        return false;
    }}>
        <FileAddTwoTone twoToneColor="#00BB00" />
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
        return (<FileLink key={fileLink} link={fileLink}>{f.locale}</FileLink>);
    });

    if (addBasketLink) {
        if (fileLinks.length) {
            fileLinks.push(<BasketLink key='basket' item={item} />);
        } else {
            fileLinks.push(<span>Kohteella ei ole ladattavia tiedostoja.</span>);
        }
    }
    return fileLinks;
};
