# Favicon Assets

This folder contains the favicon files for the Student Project Tracker application.

## Current Files

- `favicon.svg` - SVG favicon (works in modern browsers)
- `generate-favicon.html` - Tool to generate favicon.ico
- `create-favicon.ps1` - Instructions for creating favicon.ico

## Quick Setup

### Option 1: Use the SVG Favicon (Already Working!)
The SVG favicon is already configured in `index.html` and works in all modern browsers (Chrome, Firefox, Safari, Edge).

### Option 2: Generate ICO File for Older Browser Support

#### Method A: Use the HTML Generator
1. Open `assets/generate-favicon.html` in your browser
2. Click the "Download favicon.ico" button
3. Save the file as `favicon.ico` in the `assets` folder

#### Method B: Use Online Tools
1. Go to https://favicon.io/ or https://realfavicongenerator.net/
2. Upload `assets/favicon.svg`
3. Download the generated `favicon.ico`
4. Place it in the `assets` folder

#### Method C: Use Image Editor
1. Open `favicon.svg` in an image editor (Photoshop, GIMP, etc.)
2. Resize to 32x32 pixels
3. Export as `favicon.ico`
4. Save to the `assets` folder

## Favicon Design

The favicon features:
- Purple gradient background (#667eea to #764ba2)
- White checkmark symbol (representing completed projects)
- Simple, recognizable design at small sizes

## Browser Support

- **SVG Favicon**: Chrome 80+, Firefox 41+, Safari 9+, Edge 79+
- **ICO Favicon**: All browsers including older versions

The HTML includes both formats for maximum compatibility:
```html
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="alternate icon" type="image/x-icon" href="assets/favicon.ico">
```

## Customization

To customize the favicon:
1. Edit `favicon.svg` with any text editor or SVG editor
2. Change colors, shapes, or design
3. Regenerate the ICO file using one of the methods above
