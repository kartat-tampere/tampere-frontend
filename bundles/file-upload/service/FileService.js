const noopFunc = () => {};

export function uploadFiles (layerId, files, progressCB = noopFunc, successCB = noopFunc, errorCB = noopFunc) {
    progressCB(0);
    var url = Oskari.urls.getRoute('WFSAttachments');
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-XSRF-TOKEN', Oskari.app.getXSRFToken());

    // Add following event listener
    xhr.upload.addEventListener('progress', function (e) {
        progressCB((e.loaded * 100.0) / e.total || 100);
    });

    xhr.addEventListener('readystatechange', function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Done. Inform the user
            successCB();
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            // Error. Inform the user
            errorCB();
        }
    });

    formData.append('layerId', layerId);
    files.forEach(f => {
        formData.append('file', f);
        if (f.locale) {
            formData.append('locale_' + f.name, f.locale);
        }
    });
    xhr.send(formData);
}

export function listLayersWithFiles (successCB) {
    var url = Oskari.urls.getRoute('WFSAttachments');
    jQuery.get(url, successCB);
}

export function listFilesForLayer (layerId, successCB) {
    var url = Oskari.urls.getRoute('WFSAttachments') +
        `&layerId=${layerId}`;
    jQuery.get(url + `&layerId=${layerId}`, successCB);
}

export function listFilesForFeature (layerId, featureId, successCB) {
    var url = Oskari.urls.getRoute('WFSAttachments') +
        `&layerId=${layerId}&featureId=${featureId}`;
    jQuery.get(url, successCB);
}

export function openFile (layerId, fileId) {
    var url = Oskari.urls.getRoute('WFSAttachments') +
        `&layerId=${layerId}&fileId=${fileId}`;
    console.log(url);
    window.open(url, '_blank');
}
