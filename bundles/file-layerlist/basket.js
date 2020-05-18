import React from 'react';
import { Messaging } from 'oskari-ui/util';

const getFileId = (file) => {
    return file._$layerId + '||' + (file._oid || file.__fid);
};
const IGNORED_KEYS = ['_$layerId', '_oid', '__fid', '_$files'];
export const showMessage = (file) => {
    const shownKeys = Object.keys(file)
        .filter(key => !IGNORED_KEYS.includes(key))
        .map(key => (
            <tr key={key}>
                <td>{key}</td>
                <td>{file[key]}</td>
            </tr>));
    // {"external":false,"layerId":2276,"fileExtension":"pdf","id":4,"locale":"TRE 1905198","featureId":"TRE 1905198"}
    shownKeys.push((
        <tr>
            <td colSpan="2">{ getFileLinksForFeature(file._$layerId, file._$files) }</td>
        </tr>));

    Messaging.open({
        title: 'Ladattava kohde',
        content: (<table><tbody>{shownKeys}</tbody></table>)
    });
};

function getFileLinksForFeature (layerId, files) {
    var url = Oskari.urls.getRoute('WFSAttachments') + `&layerId=${layerId}`;
    return files.map(f => {
        let fileLink = `${url}&fileId=${f.id}`;
        if (f.external) {
            const fileName = encodeURIComponent(f.locale) + '.' + f.fileExtension;
            fileLink = `&featureId=${f.featureId}&name=${fileName}`;
        }
        return (<a key={fileLink} className="button" rel="noopener noreferer" target="_blank" href={fileLink}>{f.locale}</a>);
    });
}

const selectedFiles = {};
export const Basket = {
    add: (file) => {
        selectedFiles[getFileId(file)] = file;
        showMessage(file);
    },
    list: () => Object.values(selectedFiles),
    remove: (file) => { delete selectedFiles[getFileId(file)]; }
};
/*
var url = Oskari.urls.getRoute('WFSAttachments') + `&layerId=${layerId}`;
const html = files.map(f => {
    let fileLink = `&fileId=${f.id}`;
    if (f.external) {
        const fileName = encodeURIComponent(f.locale) + '.' + f.fileExtension;
        fileLink = `&featureId=${f.featureId}&name=${fileName}`;
    }
    return `<a class="button" target="_blank" 
        rel="noopener noreferer" href="${url + fileLink}">${f.locale}</a>`;
});
*/
