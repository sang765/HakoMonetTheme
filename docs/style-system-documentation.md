# Tài Liệu Hệ Thống Style HakoMonetTheme

## Tổng Quan

HakoMonetTheme sử dụng SCSS (Sass) để quản lý styles với kiến trúc modular và responsive. Hệ thống này cho phép tùy chỉnh giao diện một cách linh hoạt và maintainable.

## Kiến Trúc SCSS

### Cấu Trúc Thư Mục

```
styles/
├── animation/                 # Animation effects
│   ├── animation.scss        # Source SCSS
│   ├── animation.css         # Compiled CSS
│   └── animation.css.map     # Source map
├── device/                    # Device-specific styles
│   ├── desktop.scss
│   ├── mobile.scss
│   ├── tablet.scss
│   └── genaral.scss          # General device styles
├── font/                      # Font imports and definitions
├── info-truyen/               # Story info page styles
│   ├── device-base.scss      # Base styles for all devices
│   ├── device-desktop.scss   # Desktop-specific
│   ├── device-mobile.scss    # Mobile-specific
│   ├── device-tablet.scss    # Tablet-specific
│   ├── hmt-thumbnail-overlay.scss
│   ├── portrait.scss
│   ├── series-enhancement.scss
│   └── transparent-top.scss
├── reading-page/              # Reading page styles
├── tag-color/                 # Tag color styles
└── userscript/                # Userscript UI styles
    ├── configmenu/
    └── mainmenu/
```

### Quy Tắc Tổ Chức

#### 1. Device-Specific Styles

- **device-base.scss**: Styles chung cho tất cả devices
- **device-desktop.scss**: Styles chỉ cho desktop (>1024px)
- **device-mobile.scss**: Styles chỉ cho mobile (<768px)
- **device-tablet.scss**: Styles chỉ cho tablet (768px-1024px)

#### 2. Component-Based Organization

- Mỗi component có file SCSS riêng
- Sử dụng BEM methodology khi có thể
- Variables và mixins được tách riêng

#### 3. Responsive Design

```scss
// Mobile first approach
.my-component {
    // Base styles (mobile)

    @media (min-width: 768px) {
        // Tablet styles
    }

    @media (min-width: 1024px) {
        // Desktop styles
    }
}
```

## Build Process

### Dependencies

```json
{
  "devDependencies": {
    "sass": "^1.69.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "cssnano": "^6.0.1"
  },
  "scripts": {
    "build:styles": "node build-styles.js",
    "watch:styles": "node build-styles.js --watch"
  }
}
```

### Build Script

```javascript
// build-styles.js
const sass = require('sass');
const fs = require('fs');
const path = require('path');

function compileSCSS(filePath, outPath) {
    const result = sass.compile(filePath, {
        style: 'compressed',
        sourceMap: true,
        outFile: outPath
    });

    // Write CSS
    fs.writeFileSync(outPath, result.css);

    // Write source map
    if (result.sourceMap) {
        fs.writeFileSync(outPath + '.map', JSON.stringify(result.sourceMap));
    }

    console.log(`Compiled ${filePath} -> ${outPath}`);
}

function buildAllStyles() {
    const stylesDir = './styles';

    // Find all .scss files
    function findSCSSFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...findSCSSFiles(fullPath));
            } else if (item.endsWith('.scss')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    const scssFiles = findSCSSFiles(stylesDir);

    for (const scssFile of scssFiles) {
        const relativePath = path.relative(stylesDir, scssFile);
        const cssFile = scssFile.replace('.scss', '.css');
        compileSCSS(scssFile, cssFile);
    }
}

buildAllStyles();
```

### Watch Mode

```javascript
// Watch for changes
const chokidar = require('chokidar');

chokidar.watch('./styles/**/*.scss').on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    const cssPath = filePath.replace('.scss', '.css');
    compileSCSS(filePath, cssPath);
});
```

## Variables & Mixins

### Global Variables

```scss
// Colors
$primary-color: #063c30;
$secondary-color: #2a9d8f;
$accent-color: #e9c46a;

// Spacing
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// Breakpoints
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;
```

### Utility Mixins

```scss
// Responsive mixins
@mixin mobile-only {
    @media (max-width: #{$mobile - 1px}) {
        @content;
    }
}

@mixin tablet-up {
    @media (min-width: #{$mobile}) {
        @content;
    }
}

@mixin desktop-up {
    @media (min-width: #{$tablet}) {
        @content;
    }
}

// Color utilities
@mixin theme-colors($theme: 'dark') {
    @if $theme == 'dark' {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2a2a2a;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
    } @else {
        --bg-primary: #ffffff;
        --bg-secondary: #f5f5f5;
        --text-primary: #000000;
        --text-secondary: #666666;
    }
}

// Animation mixins
@mixin fade-in($duration: 0.3s) {
    animation: fadeIn $duration ease-in-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
}

@mixin slide-up($duration: 0.3s) {
    animation: slideUp $duration ease-out;

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
}
```

## Component Styles

### Info-Truyen Page Styles

#### device-base.scss
```scss
// Base styles for story info page
.series-cover {
    @include fade-in();
    border-radius: 8px;
    overflow: hidden;

    .img-in-ratio {
        aspect-ratio: 3/4;
        background-size: cover;
        background-position: center;
    }
}

.series-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: $spacing-md;

    @include tablet-up {
        font-size: 2rem;
    }
}
```

#### device-mobile.scss
```scss
@include mobile-only {
    .series-cover {
        margin-bottom: $spacing-lg;
    }

    .series-info {
        .info-item {
            margin-bottom: $spacing-sm;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }

    .chapter-list {
        .chapter-item {
            padding: $spacing-sm;
            border-bottom: 1px solid var(--border-color);
        }
    }
}
```

#### device-desktop.scss
```scss
@include desktop-up {
    .series-page {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: $spacing-xl;

        .series-cover {
            position: sticky;
            top: $spacing-lg;
            height: fit-content;
        }

        .series-content {
            min-height: 600px;
        }
    }

    .chapter-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: $spacing-md;
    }
}
```

### Userscript UI Styles

#### Config Menu
```scss
.hmt-config-dialog {
    .hmt-config-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        @include fade-in();
        z-index: 10000;
    }

    .hmt-config-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-primary);
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;

        @include mobile-only {
            width: 95vw;
            max-height: 95vh;
        }

        @include tablet-up {
            width: 600px;
            max-height: 80vh;
        }
    }
}
```

## CSS Custom Properties (Variables)

### Dynamic Color Variables

```scss
:root {
    // Base colors
    --primary-color: #{$primary-color};
    --secondary-color: #{$secondary-color};
    --accent-color: #{$accent-color};

    // Semantic colors
    --bg-surface: #{$surface-color};
    --bg-elevated: #{$elevated-color};
    --text-primary: #{$text-primary};
    --text-secondary: #{$text-secondary};
    --border-color: #{$border-color};

    // Spacing
    --spacing-xs: #{$spacing-xs};
    --spacing-sm: #{$spacing-sm};
    --spacing-md: #{$spacing-md};
    --spacing-lg: #{$spacing-lg};
    --spacing-xl: #{$spacing-xl};
}
```

### Theme-Specific Variables

```scss
// Dark theme
[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #404040;
}

// Light theme
[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #000000;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
}
```

## Performance Optimization

### Critical CSS

```scss
// Load critical styles immediately
.critical-styles {
    // Above-the-fold styles
    .navbar { /* ... */ }
    .hero-section { /* ... */ }
}

// Load non-critical styles asynchronously
.non-critical-styles {
    // Below-the-fold styles
    .footer { /* ... */ }
    .sidebar { /* ... */ }
}
```

### CSS Containment

```scss
.content-container {
    contain: layout style paint;
    // Improves performance by isolating layout calculations
}
```

### Font Loading Optimization

```scss
// font-import.scss
@font-face {
    font-family: 'Inter';
    font-display: swap; // Prevents invisible text during font load
    src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
}
```

## Development Workflow

### Adding New Styles

1. **Identify component location:**
   ```bash
   # For info-truyen page styles
   styles/info-truyen/component-name.scss
   ```

2. **Create SCSS file:**
   ```scss
   // styles/info-truyen/new-component.scss
   .new-component {
       // Styles here
   }
   ```

3. **Import if needed:**
   ```scss
   // In device-base.scss or appropriate file
   @import 'new-component';
   ```

4. **Build styles:**
   ```bash
   npm run build:styles
   ```

5. **Test and iterate**

### Modifying Existing Styles

1. **Find relevant SCSS file**
2. **Make changes**
3. **Build and test**
4. **Check responsive behavior**
5. **Verify accessibility**

### Debugging Styles

```scss
// Debug utilities
.debug-borders * {
    border: 1px solid red !important;
}

.debug-grid {
    background-image:
        linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
}
```

## Best Practices

### SCSS Organization

- Use consistent naming conventions
- Group related styles together
- Use variables for colors, spacing, breakpoints
- Document complex selectors

### Performance

- Minimize nesting depth
- Use specific selectors
- Avoid universal selectors (`*`)
- Combine similar media queries
- Use CSS containment where appropriate

### Maintainability

- Comment complex logic
- Use meaningful variable names
- Keep components modular
- Regular cleanup of unused styles

### Responsive Design

- Mobile-first approach
- Test on multiple devices
- Use relative units (rem, em, %)
- Consider touch targets for mobile

## Troubleshooting

### Common Issues

1. **Styles not applying:**
   - Check build process completed
   - Verify CSS loaded in browser
   - Check selector specificity
   - Look for CSS conflicts

2. **Responsive issues:**
   - Verify breakpoint values
   - Check media query syntax
   - Test on actual devices

3. **Performance problems:**
   - Audit unused CSS
   - Check for expensive selectors
   - Optimize images and fonts

### Debug Tools

```scss
// Add to development builds
.debug-info {
    &::before {
        content: "Screen: " attr(data-breakpoint);
        position: fixed;
        top: 10px;
        right: 10px;
        background: red;
        color: white;
        padding: 5px;
        z-index: 9999;
    }
}
```

## Migration Guide

### From CSS to SCSS

```css
/* Old CSS */
.header {
    background-color: #063c30;
    padding: 1rem;
}

@media (min-width: 768px) {
    .header {
        padding: 2rem;
    }
}
```

```scss
/* New SCSS */
.header {
    background-color: $primary-color;
    padding: $spacing-md;

    @include tablet-up {
        padding: $spacing-lg;
    }
}
```

### Updating Build Process

1. Install dependencies: `npm install`
2. Update build script if needed
3. Test compilation: `npm run build:styles`
4. Verify output files generated correctly

## Resources

- [Sass Documentation](https://sass-lang.com/documentation)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Responsive Design Principles](https://developers.google.com/web/fundamentals/design-and-ux/responsive)