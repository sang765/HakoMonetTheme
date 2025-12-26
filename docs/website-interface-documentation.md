# Tài Liệu Giao Diện Website HakoMonetTheme

## Tổng Quan

HakoMonetTheme bao gồm một giao diện web configuration tool được xây dựng bằng HTML, CSS và JavaScript thuần. Công cụ này cho phép người dùng cấu hình theme thông qua giao diện đồ họa trực quan.

## Kiến Trúc Giao Diện

### Cấu Trúc File

```
website/
├── app.js              # Logic chính của web app
├── interface.css       # Styles cho toàn bộ giao diện
├── nightmode.css       # Styles cho dark mode
├── plugin.js           # Plugin system
└── service-manager.js  # Quản lý service worker
```

### Công Nghệ Sử Dụng

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Custom Properties
- **Vanilla JavaScript**: No frameworks
- **Service Worker**: Offline capabilities
- **Local Storage**: Client-side persistence

## Giao Diện Chính

### Layout Structure

```html
<body>
    <nav class="navbar">
        <!-- Navigation -->
    </nav>

    <main class="main-content">
        <section class="hero-section">
            <!-- Hero content -->
        </section>

        <section class="features-section">
            <!-- Features -->
        </section>
    </main>

    <footer class="footer">
        <!-- Footer -->
    </footer>
</body>
```

### Navigation Bar

#### Desktop Navigation

```css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 46px;
    background-color: #f6f7f8;
    z-index: 9999;
}

.navbar-menu.at-navbar {
    float: left;
    margin: 0;
    padding: 0;
}

.navbar-menu.at-navbar li {
    float: left;
    height: 46px;
    overflow: hidden;
}

.navbar-menu.at-navbar .nav-menu_item {
    display: block;
    font-weight: 700;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    padding: 0 6px;
    text-align: center;
}
```

#### Mobile Navigation

```css
.navbar-menu.at-mobile {
    background-color: #f0f0f0;
    border-top: 0;
    left: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    right: 0;
    top: 46px;
}

.navbar-menu.at-mobile li {
    border-bottom: 1px solid #ddd;
    text-align: left;
    width: 100%;
}

.navbar-menu.at-mobile .nav-menu_item {
    display: block;
    font-weight: 700;
    margin: 0;
    padding: 10px;
    text-align: left;
}
```

### Hero Section

```css
.index-background {
    background: rgba(199, 203, 209, .3) url(/images/megumi-bg.jpg) no-repeat 50%;
    height: 180px;
    width: 100%;
}

.page-top-group {
    padding-top: 46px;
}
```

### Content Sections

#### Basic Section

```css
.basic-section,
.board-list,
.board_categ-list,
.detail-list,
.feature-section,
.mail-page .mail-detail-list,
.modal-content,
.page-breadcrumb,
.private-tabs,
.profile-feature,
.series-users,
.showcase-item,
.sub-index-style,
.user-pm .mail-list {
    background-color: hsla(0, 0%, 100%, .9);
    border-color: #e4e5e7 #dadbdd hsla(214, 4%, 80%, .8);
    border-radius: 4px;
    border-style: solid;
    border-width: 1px;
    overflow: hidden;
}
```

#### Section Headers

```css
#licensed-list header.section-title,
#tba-list header.section-title,
.basic-section .sect-header,
.detail-list header.section-title,
.modal-header,
.private-tabs header,
table.broad-table tr th {
    background-color: #f4f5f6;
    border-bottom: 1px solid #dadbdd;
    padding: 10px;
}
```

## Component System

### Buttons

#### Primary Buttons

```css
.button {
    background-color: #f9f9f9;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    display: inline-block;
    font-weight: 700;
    line-height: normal;
    padding: 6px 20px;
    transition: all .3s;
}

.button-green {
    background-color: #5cb85c;
    border-color: #4cae4c;
    color: #fff;
}

.button-red {
    background-color: #d9534f;
    border-color: #d43f3a;
    color: #fff;
}
```

#### Action Buttons

```css
.button-primary-green {
    background-color: #36a189;
    border-color: #0f9779;
    color: #fff;
}

.button-primary-green:hover {
    color: #0f9779;
}
```

### Forms

#### Input Fields

```css
.field {
    width: 100%;
}

.form-group {
    overflow: hidden;
}

.form-group label {
    display: inline-block;
    padding-top: 8px;
}
```

#### Select Dropdowns

```css
.select {
    display: block;
    position: relative;
}

.select:before {
    border: 6px solid transparent;
    border-top-color: #676767;
    content: "";
    margin-top: -3px;
    pointer-events: none;
    position: absolute;
    right: 10px;
    top: 50%;
}

.select select {
    -webkit-appearance: none;
    -moz-appearance: none;
    background: #fff;
    border: 1px solid #ccc;
    display: block;
    height: 36px;
    line-height: normal;
    padding: 0 10px;
    width: 100%;
}
```

### Cards & Panels

#### Modal System

```css
.modal {
    background-color: #000;
    background-color: rgba(0, 0, 0, .9);
    display: none;
    height: 100%;
    left: 0;
    overflow: auto;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 100px;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 9999;
}

.modal-content {
    border: 0;
    margin: auto;
    max-width: 560px;
    min-width: 320px;
    padding: 0;
    position: relative;
}
```

#### Feature Cards

```css
.feature-section {
    margin-bottom: 20px;
}

.feature-section main {
    padding: 0;
    position: relative;
}

.feature-section .series-type {
    background-color: #36a189;
    border-radius: 4px;
    color: #fff;
    display: inline-block;
    font-weight: 700;
    margin-bottom: 20px;
    padding: 6px 10px;
    position: relative;
    text-align: center;
    width: 100%;
}
```

### Lists & Grids

#### Chapter Lists

```css
ul.list-chapters {
    margin: 0;
    padding: 0;
}

ul.list-chapters li {
    padding: 5px 10px;
    position: relative;
}

ul.list-chapters li:nth-child(2n) {
    background-color: #f9f9f9;
}

ul.list-chapters li:hover {
    background-color: #f0f0f0;
}
```

#### Thumbnail Grids

```css
.thumb-item-flow {
    margin-bottom: 10px;
    margin-top: 10px;
}

.thumb-item-flow .a6-ratio {
    overflow: hidden;
    width: 100%;
}

.thumb-item-flow .thumb-detail {
    background: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, .8) 67%, rgba(0, 0, 0, .8));
    bottom: 0;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#00000000", endColorstr="#cc000000", GradientType=0);
    left: 0;
    overflow: hidden;
    padding: 10px;
    position: absolute;
    width: 100%;
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media only screen and (max-width: 787px) {
    /* Mobile-specific styles */
}

/* Tablet */
@media only screen and (min-width: 788px) and (max-width: 999px) {
    /* Tablet-specific styles */
}

/* Desktop */
@media only screen and (min-width: 1000px) {
    /* Desktop-specific styles */
}

/* Large Desktop */
@media only screen and (min-width: 1220px) {
    /* Large desktop-specific styles */
}
```

### Mobile Optimizations

```css
@media only screen and (max-width: 787px) {
    .feature-section .series-information {
        margin-bottom: 0;
    }

    .bottom-features {
        margin-top: 10px;
        position: static;
    }

    .feature-section .series-name {
        font-size: 20px;
        font-size: 1.25rem;
        line-height: 26px;
        line-height: 1.625rem;
    }
}
```

### Tablet Optimizations

```css
@media only screen and (min-width: 788px) and (max-width: 999px) {
    .popular-thumb-item:nth-of-type(5),
    .popular-thumb-item:nth-of-type(6) {
        display: none;
    }
}
```

## Dark Mode Support

### Night Mode Styles

```css
/* nightmode.css */
body.night-mode {
    background-color: #1a1a1a;
    color: #ffffff;
}

.night-mode .basic-section,
.night-mode .board-list,
.night-mode .board_categ-list,
.night-mode .detail-list,
.night-mode .feature-section,
.night-mode .mail-page .mail-detail-list,
.night-mode .modal-content,
.night-mode .page-breadcrumb,
.night-mode .private-tabs,
.night-mode .profile-feature,
.night-mode .series-users,
.night-mode .showcase-item,
.night-mode .sub-index-style,
.night-mode .user-pm .mail-list {
    background-color: #2a2a2a;
    border-color: #404040;
    color: #ffffff;
}
```

### Theme Toggle

```javascript
// Toggle night mode
function toggleNightMode() {
    const body = document.body;
    const isNightMode = body.classList.contains('night-mode');

    if (isNightMode) {
        body.classList.remove('night-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('night-mode');
        localStorage.setItem('theme', 'dark');
    }
}
```

## JavaScript Integration

### App.js Structure

```javascript
// app.js
(function() {
    'use strict';

    // DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initApp();
    });

    function initApp() {
        setupNavigation();
        setupThemeToggle();
        setupScrollEffects();
        loadDynamicContent();
    }

    function setupNavigation() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.navbar-menu.at-mobile');

        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }

    function setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';

        if (currentTheme === 'dark') {
            document.body.classList.add('night-mode');
        }

        themeToggle.addEventListener('click', toggleNightMode);
    }
})();
```

### Plugin System

```javascript
// plugin.js
const PluginManager = {
    plugins: [],

    register: function(name, plugin) {
        this.plugins.push({
            name: name,
            instance: plugin
        });
    },

    init: function() {
        this.plugins.forEach(function(plugin) {
            if (plugin.instance.init) {
                plugin.instance.init();
            }
        });
    }
};
```

## Performance Optimizations

### CSS Optimizations

```css
/* Critical CSS inlined */
.critical-styles {
    /* Above-the-fold styles */
}

/* Non-critical CSS lazy loaded */
.non-critical-styles {
    /* Below-the-fold styles */
}
```

### Image Optimization

```css
/* Responsive images */
.series-cover img {
    max-width: 100%;
    height: auto;
}

/* Lazy loading */
.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazy.loaded {
    opacity: 1;
}
```

### JavaScript Performance

```javascript
// Debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedScroll = debounce(handleScroll, 16);
window.addEventListener('scroll', debouncedScroll);
```

## Accessibility

### Focus Management

```css
/* Focus indicators */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}
```

### Screen Reader Support

```css
/* Screen reader only content */
.sr-only {
    clip: rect(0 0 0 0);
    border: 0;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}
```

### Color Contrast

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
    .button {
        border: 2px solid;
    }

    .basic-section {
        border-width: 2px;
    }
}
```

## Browser Support

### Supported Browsers

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Fallbacks

```css
/* Flexbox fallbacks */
.flex {
    display: flex;
}

.no-flexbox .flex {
    display: block;
}

/* CSS Grid fallbacks */
.grid {
    display: grid;
}

.no-cssgrid .grid {
    display: block;
}
```

## Development Workflow

### Local Development

1. **Setup local server:**
   ```bash
   cd HakoMonetTheme
   python3 -m http.server 8000
   ```

2. **Access interface:**
   ```
   http://localhost:8000/website/
   ```

3. **Live reload:**
   ```javascript
   // Auto-reload for development
   if (location.hostname === 'localhost') {
       setInterval(() => {
           fetch(location.href)
               .then(response => response.text())
               .then(html => {
                   if (html !== document.documentElement.outerHTML) {
                       location.reload();
                   }
               });
       }, 1000);
   }
   ```

### Build Process

```javascript
// build-website.js
const fs = require('fs');
const path = require('path');

function buildWebsite() {
    // Minify CSS
    const css = fs.readFileSync('website/interface.css', 'utf8');
    const minifiedCss = minifyCSS(css);
    fs.writeFileSync('website/interface.min.css', minifiedCss);

    // Minify JS
    const js = fs.readFileSync('website/app.js', 'utf8');
    const minifiedJs = minifyJS(js);
    fs.writeFileSync('website/app.min.js', minifiedJs);

    console.log('Website build complete');
}
```

## Testing

### Manual Testing Checklist

- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode toggle functionality
- [ ] Navigation menu interactions
- [ ] Form submissions
- [ ] Image loading and fallbacks
- [ ] Accessibility with keyboard navigation
- [ ] Cross-browser compatibility

### Automated Testing

```javascript
// Basic functionality tests
describe('Website Interface', () => {
    it('should toggle mobile menu', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.navbar-menu.at-mobile');

        menuToggle.click();
        assert(mobileMenu.classList.contains('active'));
    });

    it('should switch themes', () => {
        const themeToggle = document.querySelector('.theme-toggle');
        const body = document.body;

        themeToggle.click();
        assert(body.classList.contains('night-mode'));
    });
});
```

## Deployment

### Static Hosting

The website can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

### CDN Integration

```html
<!-- Load from CDN for better performance -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme/website/interface.min.css">
<script src="https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme/website/app.min.js"></script>
```

## Future Enhancements

### Planned Features

- [ ] PWA capabilities
- [ ] Multi-language support
- [ ] Advanced theme editor
- [ ] User preference sync
- [ ] Analytics integration

### Performance Improvements

- [ ] Code splitting
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle analysis

This documentation provides a comprehensive overview of the HakoMonetTheme website interface, covering its architecture, components, responsive design, and development practices.