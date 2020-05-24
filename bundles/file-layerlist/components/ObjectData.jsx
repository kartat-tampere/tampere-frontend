import React from 'react';
import PropTypes from 'prop-types';
import { Basket } from '../basket';
import styled from 'styled-components';
import { Button } from 'antd';
import { CloudDownloadOutlined, FileAddOutlined } from '@ant-design/icons';

/**
 * Creates an object data presentation of feature with possible file links
 */
const IGNORED_KEYS = ['_$layerId', '_oid', '__fid', '_$files', '_$coord'];
export const ObjectData = ({ item, addBasketLink = false }) => {
    const shownKeys = Object.keys(item)
        .filter(key => !IGNORED_KEYS.includes(key))
        .map(key => (<Row key={key} field={key} value={item[key]} />));
    return (<Table>
        {shownKeys}
        <LinkArea>
            { getFileLinksForFeature(item._$layerId, item._$files, addBasketLink, item) }
        </LinkArea>
    </Table>);
};
ObjectData.propTypes = {
    item: PropTypes.any.isRequired,
    addBasketLink: PropTypes.bool
};

// {"external":false,"layerId":2276,"fileExtension":"pdf","id":4,"locale":"TRE 1905198","featureId":"TRE 1905198"}
function getFileLinksForFeature (layerId, files = [], addBasketLink, item) {
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

const LinkButton = styled(Button)`
    margin-right: 5px;
`;
const FileLink = ({ link, children }) => {
    return (<LinkButton size={'small'} onClick={() => {
        window.open(link, '_blank');
        return false;
    }}><CloudDownloadOutlined />{ children }</LinkButton>);
};
FileLink.propTypes = {
    link: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired
};

const BasketLink = ({ item }) => {
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

const StyledTable = styled('table')`
    margin: 0px !important;
    border-top-width: 0px !important;
`;
const Table = ({ children }) => (
    <StyledTable>
        <tbody>{ children }</tbody>
    </StyledTable>);
Table.propTypes = {
    children: PropTypes.any.isRequired
};

const Row = ({ field, value }) => (
    <tr>
        <td>{ field }</td>
        <td dangerouslySetInnerHTML={ { __html: value } } />
    </tr>);
Row.propTypes = {
    field: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
};

const LinkArea = ({ children }) => (
    <tr>
        <td colSpan="2">{ children }</td>
    </tr>);

LinkArea.propTypes = {
    children: PropTypes.any.isRequired
};
