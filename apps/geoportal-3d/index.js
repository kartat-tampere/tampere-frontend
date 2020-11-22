jQuery(document).ready(function () {
    Oskari.app.loadAppSetup(window.location.pathname + 'action?action_route=GetAppSetup', window.controlParams, function () {
        jQuery('#mapdiv').append('Unable to start');
    });
});
