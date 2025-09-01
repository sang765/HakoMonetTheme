// ==UserScript==
// @name         Hako: Monet Theme
// @namespace    https://github.com/sang765
// @version      2.9.5
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
// @connect      *
// @run-at       document-end
// @require      https://greasyfork.org/scripts/447115-gm-config/code/GM_config.js?version=1060849
// @resource     mainJS ./main.js
// @resource     monetJS ./module/monet.js
// @resource     crosUnblockJS ./module/cros-unblock.js
// @resource     infoTruyenJS ./class/info-truyen.js
// @resource     animationJS ./class/animation.js
// @resource     monetClassJS ./class/monet.js
// @resource     tagColorJS ./class/tag-color.js
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @downloadURL  https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Load main.js
    const mainJS = GM_getResourceText('mainJS');
    eval(mainJS);
})();
