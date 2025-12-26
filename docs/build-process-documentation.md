# Tài Liệu Quy Trình Build HakoMonetTheme

## Tổng Quan

HakoMonetTheme sử dụng quy trình build để compile SCSS thành CSS, tối ưu hóa assets, và chuẩn bị project cho distribution. Tài liệu này mô tả cách thiết lập và sử dụng build process.

## Yêu Cầu Hệ Thống

### Dependencies

```json
{
  "dependencies": {
    "coloris": "^0.1.0",
    "cropperjs": "^2.1.0",
    "express": "^4.18.2",
    "chokidar": "^3.5.3",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "typescript": "^5.9.3",
    "sass": "^1.69.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "cssnano": "^6.0.1",
    "terser": "^5.24.0",
    "chokidar": "^3.5.3"
  }
}
```

### Cài Đặt

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

## Cấu Trúc Build Scripts

### build-styles.js

```javascript
// build-styles.js
const sass = require('sass');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

async function compileSCSS(filePath, outPath) {
    try {
        // Compile SCSS
        const result = sass.compile(filePath, {
            style: 'expanded',
            sourceMap: true,
            outFile: outPath
        });

        // PostCSS processing
        const processed = await postcss([
            autoprefixer({
                overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead']
            }),
            cssnano({
                preset: ['default', {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: false
                }]
            })
        ]).process(result.css, {
            from: outPath,
            to: outPath.replace('.css', '.min.css'),
            map: { inline: false }
        });

        // Write expanded CSS
        fs.writeFileSync(outPath, result.css);

        // Write minified CSS
        fs.writeFileSync(outPath.replace('.css', '.min.css'), processed.css);

        // Write source maps
        if (result.sourceMap) {
            fs.writeFileSync(outPath + '.map', JSON.stringify(result.sourceMap));
        }

        if (processed.map) {
            fs.writeFileSync(outPath.replace('.css', '.min.css.map'), processed.map.toString());
        }

        console.log(`✓ Compiled ${filePath} -> ${outPath}`);
        console.log(`✓ Minified -> ${outPath.replace('.css', '.min.css')}`);

    } catch (error) {
        console.error(`✗ Error compiling ${filePath}:`, error.message);
        process.exit(1);
    }
}

function findSCSSFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && item !== 'node_modules') {
            files.push(...findSCSSFiles(fullPath));
        } else if (item.endsWith('.scss') && !item.startsWith('_')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function buildAllStyles() {
    const stylesDir = './styles';
    const scssFiles = findSCSSFiles(stylesDir);

    console.log(`Building ${scssFiles.length} SCSS files...`);

    for (const scssFile of scssFiles) {
        const relativePath = path.relative(stylesDir, scssFile);
        const cssFile = scssFile.replace('.scss', '.css');
        await compileSCSS(scssFile, cssFile);
    }

    console.log('✓ All styles compiled successfully!');
}

if (require.main === module) {
    buildAllStyles();
}

module.exports = { compileSCSS, findSCSSFiles, buildAllStyles };
```

### build-userscript.js

```javascript
// build-userscript.js
const fs = require('fs');
const path = require('path');
const terser = require('terser');

async function buildUserscript() {
    console.log('Building HakoMonetTheme userscript...');

    // Read main userscript file
    const userscriptPath = './HakoMonetTheme.user.js';
    let userscript = fs.readFileSync(userscriptPath, 'utf8');

    // Extract resource URLs and replace with local paths for development
    const resourceRegex = /@resource\s+(\w+)\s+(https:\/\/[^\s]+)/g;
    const resources = {};

    let match;
    while ((match = resourceRegex.exec(userscript)) !== null) {
        resources[match[1]] = match[2];
    }

    // For production build, ensure all resources are available
    console.log('Checking resources...');
    for (const [name, url] of Object.entries(resources)) {
        if (!url.includes('sang765.github.io')) {
            console.warn(`⚠ Resource ${name} points to non-production URL: ${url}`);
        }
    }

    // Minify embedded JavaScript if any
    // (The main logic is already in separate files)

    // Update version if needed
    const version = process.env.VERSION || '1.0.0';
    userscript = userscript.replace(/@version\s+[\d.]+/, `@version ${version}`);

    // Write production userscript
    fs.writeFileSync('./dist/HakoMonetTheme.user.js', userscript);
    console.log('✓ Userscript built successfully!');
}

async function buildDistribution() {
    // Create dist directory
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
    }

    // Copy essential files
    const filesToCopy = [
        'HakoMonetTheme.user.js',
        'README.md',
        'LICENSE'
    ];

    for (const file of filesToCopy) {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, `./dist/${file}`);
        }
    }

    // Build userscript
    await buildUserscript();

    console.log('✓ Distribution build complete!');
}

if (require.main === module) {
    buildDistribution();
}

module.exports = { buildUserscript, buildDistribution };
```

### watch.js

```javascript
// watch.js
const chokidar = require('chokidar');
const { compileSCSS } = require('./build-styles');

function startWatch() {
    console.log('Starting file watcher...');

    // Watch SCSS files
    const scssWatcher = chokidar.watch('./styles/**/*.scss', {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

    scssWatcher.on('change', (filePath) => {
        console.log(`SCSS file changed: ${filePath}`);
        const cssPath = filePath.replace('.scss', '.css');
        compileSCSS(filePath, cssPath);
    });

    // Watch JavaScript files
    const jsWatcher = chokidar.watch('./module/**/*.js', {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    jsWatcher.on('change', (filePath) => {
        console.log(`JS file changed: ${filePath}`);
        // Could add JS linting/transpilation here
    });

    console.log('✓ File watcher started. Press Ctrl+C to stop.');
}

if (require.main === module) {
    startWatch();
}

module.exports = { startWatch };
```

## Package.json Scripts

```json
{
  "scripts": {
    "build": "node build-userscript.js && node build-styles.js",
    "build:styles": "node build-styles.js",
    "build:userscript": "node build-userscript.js",
    "watch": "node watch.js",
    "watch:styles": "node watch.js --styles-only",
    "dev": "npm run watch",
    "lint": "eslint module/ class/ --ext .js",
    "lint:fix": "eslint module/ class/ --ext .js --fix",
    "test": "node test-runner.js",
    "clean": "rm -rf dist/ && find styles/ -name '*.css' -delete && find styles/ -name '*.map' -delete",
    "prepublish": "npm run clean && npm run build"
  }
}
```

## Quy Trình Build

### Development Build

```bash
# Build all assets
npm run build

# Build only styles
npm run build:styles

# Build only userscript
npm run build:userscript
```

### Watch Mode

```bash
# Watch for changes and rebuild automatically
npm run watch

# Watch only styles
npm run watch:styles
```

### Production Build

```bash
# Clean and build for production
npm run prepublish

# Or manually
npm run clean && npm run build
```

## SCSS Compilation

### File Structure

```
styles/
├── animation/
│   ├── animation.scss     # Source
│   ├── animation.css      # Compiled
│   └── animation.css.map  # Source map
├── device/
│   ├── desktop.scss
│   ├── mobile.scss
│   └── tablet.scss
├── info-truyen/
│   ├── device-base.scss
│   ├── device-desktop.scss
│   ├── device-mobile.scss
│   └── device-tablet.scss
└── ...
```

### Compilation Process

1. **Parse SCSS**: Convert SCSS syntax to CSS
2. **Resolve imports**: Include `@import` statements
3. **Apply mixins**: Process `@mixin` and `@include`
4. **Calculate functions**: Execute SCSS functions
5. **Generate source maps**: Create debugging information

### PostCSS Processing

1. **Autoprefixer**: Add vendor prefixes
2. **CSSNano**: Minify CSS
3. **CSSNext**: Use future CSS features

## Asset Optimization

### CSS Optimization

```javascript
const cssnano = require('cssnano');

const postcssConfig = [
    autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead']
    }),
    cssnano({
        preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: false,
            colormin: true,
            convertValues: true,
            mergeRules: true,
            minifySelectors: true
        }]
    })
];
```

### JavaScript Optimization

```javascript
const terser = require('terser');

async function minifyJS(code) {
    const result = await terser.minify(code, {
        compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
            toplevel: true
        },
        sourceMap: true
    });

    return result.code;
}
```

## Distribution

### Directory Structure

```
dist/
├── HakoMonetTheme.user.js    # Main userscript
├── README.md                  # Documentation
├── LICENSE                    # License file
└── assets/                    # Additional assets (if any)
```

### CDN Integration

For production, update resource URLs in userscript header:

```javascript
// @resource    animationCSS    https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme@latest/styles/animation/animation.min.css
// @resource    configCSS       https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme@latest/styles/userscript/configmenu/hmt-config-menu.min.css
```

## Quality Assurance

### Linting

```bash
# Lint JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Testing

```javascript
// test-runner.js
const { JSDOM } = require('jsdom');

async function runTests() {
    console.log('Running tests...');

    // Setup DOM environment
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost'
    });

    global.window = dom.window;
    global.document = dom.window.document;

    // Load and test modules
    // ... test code ...

    console.log('✓ All tests passed!');
}

if (require.main === module) {
    runTests();
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint code
      run: npm run lint

    - name: Build project
      run: npm run build

    - name: Run tests
      run: npm test

    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Performance Monitoring

### Build Metrics

```javascript
class BuildMetrics {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            filesProcessed: 0,
            totalSize: 0,
            errors: []
        };
    }

    recordFile(filePath, size) {
        this.metrics.filesProcessed++;
        this.metrics.totalSize += size;
    }

    recordError(error) {
        this.metrics.errors.push(error);
    }

    report() {
        const duration = Date.now() - this.startTime;
        console.log(`
Build Report:
- Duration: ${duration}ms
- Files processed: ${this.metrics.filesProcessed}
- Total size: ${(this.metrics.totalSize / 1024).toFixed(2)} KB
- Errors: ${this.metrics.errors.length}
        `);

        if (this.metrics.errors.length > 0) {
            console.log('Errors:', this.metrics.errors);
        }
    }
}
```

## Troubleshooting

### Common Build Issues

1. **SCSS Compilation Errors**
   ```bash
   # Check for syntax errors
   npx sass --check styles/

   # Debug specific file
   npx sass --debug styles/path/to/file.scss
   ```

2. **Missing Dependencies**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Watch Mode Not Working**
   ```bash
   # Check file permissions
   ls -la styles/

   # Restart watch mode
   npm run watch
   ```

4. **Production Build Issues**
   ```bash
   # Check environment variables
   echo $VERSION

   # Manual version override
   VERSION=1.2.3 npm run build
   ```

### Debug Mode

```javascript
// Enable verbose logging
process.env.DEBUG = 'build:*';

// Run with debug flags
node --inspect build-styles.js
```

## Best Practices

### Development

- Always run `npm run watch` during development
- Test builds on multiple environments
- Keep build scripts modular and reusable
- Document any custom build steps

### Production

- Use minified assets in production
- Enable source maps for debugging
- Set appropriate cache headers
- Monitor bundle sizes

### Maintenance

- Regularly update dependencies
- Keep build scripts versioned
- Document breaking changes
- Test builds after dependency updates

## Future Enhancements

### Planned Features

- [ ] Webpack integration for advanced bundling
- [ ] Image optimization pipeline
- [ ] Automated deployment scripts
- [ ] Build performance monitoring
- [ ] Cross-platform build support

### Performance Improvements

- [ ] Parallel processing for large builds
- [ ] Incremental builds with caching
- [ ] Build artifact caching
- [ ] CDN upload automation

This build process ensures HakoMonetTheme is properly compiled, optimized, and ready for distribution across different environments.