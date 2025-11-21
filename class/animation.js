(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    const FOLDER_URL = 'https://sang765.github.io/HakoMonetTheme/styles/';
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Animation]', ...args);
        }
    }
    
    function initAnimation() {
        debugLog('Animation class đã được tải');

        // Thêm các animation CSS
        addAnimations();

        // Thêm toggle cho collapsible sections
        initCollapsibleSections();
    }
    
    function addAnimations() {
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'animation/animation.css').then(r => r.text()),
            fetch(FOLDER_URL + 'animation/animation.css.map').then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Tạo Blob URL cho quản lý tài nguyên hiệu quả
            const blob = new Blob([css], { type: 'text/css' });
            const blobUrl = URL.createObjectURL(blob);

            // Tạo link element và áp dụng CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = blobUrl;
            document.head.appendChild(link);

            debugLog('Đã thêm animations với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải animation/animation.css hoặc source map:', error);
        });
    }

    function initCollapsibleSections() {
        debugLog('Khởi tạo collapsible sections');

        // Tìm tất cả các section series-note
        const sections = document.querySelectorAll('section.series-note');

        sections.forEach(section => {
            const header = section.querySelector('.sect-header');
            const main = section.querySelector('main');
            const icon = section.querySelector('.mobile-icon i');

            if (!header || !main || !icon) return;

            // Kiểm tra trạng thái ban đầu dựa trên display
            const isOpen = main.style.display !== 'none';
            if (isOpen) {
                section.classList.add('open');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                section.classList.remove('open');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }

            // Thêm event listener
            header.addEventListener('click', function(e) {
                e.preventDefault();

                const isCurrentlyOpen = section.classList.contains('open');

                if (isCurrentlyOpen) {
                    // Đóng
                    section.classList.remove('open');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                    // Để transition hoàn thành trước khi set display none
                    setTimeout(() => {
                        main.style.display = 'none';
                    }, 300);
                } else {
                    // Mở
                    main.style.display = ''; // Xóa display none
                    section.classList.add('open');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            });
        });
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimation);
    } else {
        initAnimation();
    }
})();
