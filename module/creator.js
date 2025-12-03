(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const OWNER_USER_ID = '156992';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[OwnershipProof]', ...args);
        }
    }

    /**
     * Check if current page is the owner's profile
     */
    function isOwnerProfile() {
        const currentUrl = window.location.href;
        const profileMatch = currentUrl.match(/\/thanh-vien\/(\d+)/);
        if (profileMatch && profileMatch[1] === OWNER_USER_ID) {
            return true;
        }
        return false;
    }

    /**
     * Add ownership proof badge to the profile
     */
    function addOwnershipBadge() {
        debugLog('Adding ownership proof badge');

        // Check if badge already exists
        if (document.querySelector('.ownership-proof-badge')) {
            debugLog('Ownership badge already exists');
            return;
        }

        // Find the profile intro section
        const profileIntro = document.querySelector('.profile-intro');
        if (!profileIntro) {
            debugLog('Profile intro not found');
            return;
        }

        // Add CSS animation for color background
        const style = document.createElement('style');
        style.textContent = `
            @keyframes colorShift {
                0% { background-color: #ff0000; }
                20% { background-color: #ffa500; }
                40% { background-color: #00ff00; }
                60% { background-color: #0000ff; }
                80% { background-color: #800080; }
                100% { background-color: #ff0000; }
            }
        `;
        document.head.appendChild(style);

        // Create the ownership badge
        const badge = document.createElement('div');
        badge.className = 'ownership-proof-badge';
        badge.style.cssText = `
            background-color: #ff0000;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            margin-top: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            display: inline-block;
            animation: colorShift 10s ease infinite;
        `;
        badge.innerHTML = `
            <i class="fas fa-crown" style="margin-right: 5px;"></i>
            Hako: Monet Theme Creator
        `;

        // Insert the badge after the profile name
        const profileName = profileIntro.querySelector('.profile-intro_name');
        if (profileName) {
            profileName.insertAdjacentElement('afterend', badge);
            debugLog('Ownership badge added successfully');
        } else {
            debugLog('Profile name not found, appending to intro');
            profileIntro.appendChild(badge);
        }
    }

    /**
     * Add ownership proof to profile bio
     */
    function addOwnershipToBio() {
        debugLog('Adding ownership proof to bio');

        const bioElement = document.querySelector('.p-s_i-bio p');
        if (!bioElement) {
            debugLog('Bio element not found');
            return;
        }

        // Check if proof already exists
        if (bioElement.querySelector('span') && bioElement.querySelector('span').textContent.includes('Verified')) {
            debugLog('Ownership proof already in bio');
            return;
        }

        // Add a special marker at the end of the bio
        const proofText = document.createElement('span');
        proofText.style.cssText = `
            display: block;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
            font-style: italic;
            opacity: 0.7;
        `;
        proofText.textContent = `🔒 Verified: This profile belongs to the creator of HakoMonetTheme`;

        bioElement.appendChild(proofText);
        debugLog('Ownership proof added to bio');
    }

    /**
     * Add user role on story info pages
     */
    function addUserRoleOnStoryPage() {
        debugLog('Adding user role on story page');

        const seriesOwners = document.querySelectorAll('.series-owner');
        for (let owner of seriesOwners) {
            const nameLink = owner.querySelector('.series-owner_name a');
            if (nameLink && nameLink.href.includes('/thanh-vien/156992')) {
                const titleDiv = owner.querySelector('.series-owner-title');
                if (titleDiv && !titleDiv.querySelector('.user-role')) {
                    const roleSpan = document.createElement('span');
                    roleSpan.className = 'user-role';
                    roleSpan.textContent = 'Hako: Monet Theme';
                    titleDiv.appendChild(roleSpan);
                    debugLog('User role added to story page');
                }
            }
        }
    }

    /**
     * Initialize the ownership proof module
     */
    function init() {
        debugLog('Initializing Creator module');

        // Check if we're on the owner's profile page
        if (isOwnerProfile()) {
            debugLog('On owner profile page, adding creator badge');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    addOwnershipBadge();
                    addOwnershipToBio();
                });
            } else {
                addOwnershipBadge();
                addOwnershipToBio();
            }

            // Also try after a delay in case content loads dynamically
            setTimeout(function() {
                addOwnershipBadge();
                addOwnershipToBio();
            }, 2000);
        } else {
            debugLog('Not on owner profile page, checking for story page');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    addUserRoleOnStoryPage();
                });
            } else {
                addUserRoleOnStoryPage();
            }

            // Also try after a delay in case content loads dynamically
            setTimeout(function() {
                addUserRoleOnStoryPage();
            }, 2000);
        }

        debugLog('Ownership Proof module initialized');
    }

    // Export module
    window.HMTOwnershipProof = {
        init: init,
        isOwnerProfile: isOwnerProfile,
        addOwnershipBadge: addOwnershipBadge,
        addOwnershipToBio: addOwnershipToBio,
        addUserRoleOnStoryPage: addUserRoleOnStoryPage
    };

    // Auto-initialize
    init();

})();