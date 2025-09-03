// ==UserScript==
// @name         Hako: Monet Theme
// @namespace    https://github.com/sang765
// @version      2.9.9
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
// @icon         https://docln.sbs/img/logo-9.png
// @author       SangsDayy
// @match        https://docln.sbs/*
// @match        https://docln.net/*
// @match        https://ln.hako.vn/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_openInTab
// @connect      *
// @run-at       document-end
// @require      https://greasyfork.org/scripts/447115-gm-config/code/GM_config.js?version=1060849
// @resource     configJS ./config.js
// @resource     utilsJS ./utils.js
// @resource     coreJS ./core.js
// @resource     monetAPIJS ./api/monet.js
// @resource     crosUnblockJS ./module/cros-unblock.js
// @resource     infoTruyenJS ./class/info-truyen.js
// @resource     animationJS ./class/animation.js
// @resource     tagColorJS ./class/tag-color.js
// @resource     colorUtilsJS ./module/color-utils.js
// @resource     domUtilsJS ./module/dom-utils.js
// @resource     storageJS ./module/storage.js
// @resource     settingsJS ./module/settings.js
// @resource     colorinfotruyen ./colors/page-info-truyen.js
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @downloadURL  https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Load core configuration and utilities first
    const coreResources = ['configJS', 'utilsJS', 'coreJS'];

    // Load core resources synchronously
    coreResources.forEach(resourceName => {
        try {
            const resourceContent = GM_getResourceText(resourceName);
            if (resourceContent) {
                // Use Function constructor for safer script execution
                const func = new Function(resourceContent);
                func();
            } else {
                console.error(`[HakoMonetTheme] Core resource not found: ${resourceName}`);
            }
        } catch (error) {
            console.error(`[HakoMonetTheme] Failed to load core resource ${resourceName}:`, error);
        }
    });

    // Initialize the core system
    if (window.HakoMonetCore) {
        // Core will handle initialization automatically
        HakoMonetUtils.Logger.info('HakoMonetTheme userscript loaded successfully');
    } else {
        console.error('[HakoMonetTheme] Core system failed to load');
    }

})();
