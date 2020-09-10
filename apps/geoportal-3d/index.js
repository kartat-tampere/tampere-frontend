'use strict';

/**
 * Loads Cesium-library and holds jQuery document ready until loaded.
 */
(function () {
    jQuery.holdReady(true);
    var CESIUM_LIB_URL = '/Oskari/libraries/Cesium/Cesium.js';
    var script = document.createElement('script');
    script.src = CESIUM_LIB_URL;
    script.onload = function () {
        jQuery.holdReady(false);
    };
    document.head.appendChild(script);
}());
// Polyfills DOM4 MouseEvent for olcs
(function (window) {
    try {
        new MouseEvent('test');
        return false; // No need to polyfill
    } catch (e) {
        // Need to polyfill - fall through
    }
    var MouseEvent = function (eventType, params) {
        params = params || { bubbles: false, cancelable: false };
        var mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, params.screenX || 0, params.screenY || 0, params.clientX || 0, params.clientY || 0, false, false, false, false, 0, null);
        return mouseEvent;
    };
    MouseEvent.prototype = Event.prototype;
    window.MouseEvent = MouseEvent;
})(window);

/**
 * Start when dom ready
 */
jQuery(document).ready(function () {
    var getAppSetupParams = {};
    // populate url with possible control parameters
    Object.keys(window.controlParams || {}).forEach(function (key) {
        getAppSetupParams[key] = window.controlParams[key];
    });

    jQuery.ajax({
        type: 'POST',
        dataType: 'json',
        data: getAppSetupParams,
        url: window.location.pathname + 'action?action_route=GetAppSetup',
        success: function (appSetup) {
            var app = Oskari.app;
            if (!appSetup.startupSequence) {
                jQuery('#mapdiv').append('Unable to start');
                return;
            }
            app.init(appSetup);
            app.startApplication();
        },
        error: function (jqXHR, textStatus) {
            if (jqXHR.status !== 0) {
                jQuery('#mapdiv').append('Unable to start');
            }
        }
    });
});
