# Selector Verifier Chrome Extension

A powerful Chrome DevTools extension for testing and verifying CSS selectors on web pages. This tool helps developers quickly test CSS selectors, highlight matching elements, and analyze DOM structure.

## Features

- 🎯 **Selector Testing**: Test any CSS selector and see detailed results
- 🔍 **Element Highlighting**: Visual highlighting of matched elements with numbered labels
- 📊 **Detailed Analysis**: Get comprehensive information about matched elements including:
  - Tag names and attributes
  - Element position and visibility
  - Text content preview
  - Class names and IDs
- 🧹 **Easy Cleanup**: One-click clearing of highlights
- 🚀 **DevTools Integration**: Seamlessly integrated into Chrome DevTools

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `selector-verifier` folder
5. The extension should now appear in your extensions list

### Method 2: Manual Installation

1. Download the extension files
2. Open Chrome DevTools (F12)
3. Navigate to any webpage
4. Look for the "Selector Verifier" tab in DevTools

## Usage

### Main Panel
1. **Open DevTools**: Press F12 or right-click and select "Inspect"
2. **Find the Selector Verifier Tab**: Look for the "Selector Verifier" tab in the main DevTools panel
3. **Choose your view mode**:
   - **Full Mode**: Complete interface with all features and tips
   - **Compact Mode**: Click "📱 Compact Mode" for a sidebar-like experience

### Compact Mode (Sidebar Alternative)
- **Toggle**: Click the "📱 Compact Mode" button in the top-right corner
- **Benefits**: Narrower layout that works well alongside other DevTools panels
- **Perfect for**: When you want to keep Elements panel open while testing selectors
- **Switch back**: Click "🖥️ Full Mode" to return to the complete interface

### Basic Operations
1. **Enter a CSS Selector**: Type any valid CSS selector in the input field
2. **Test the Selector**: Click "Test" to see matching elements
3. **Highlight Elements**: Click "Highlight" to visually highlight matches on the page
4. **Clear Highlights**: Click "Clear" to remove all visual indicators

## Example Selectors

Try these example selectors to get started:

```css
/* Basic selectors */
div
.container
#main-content

/* Attribute selectors */
a[href*="example"]
input[type="text"]
img[alt]

/* Pseudo-selectors */
p:first-child
li:nth-child(odd)
a:hover

/* Complex selectors */
.header > .nav li
form input[required]
.content p:not(.highlight)
```

## Features Explained

### Test Selector
- Shows the number of matching elements
- Displays detailed information for each match
- Reports any selector syntax errors

### Highlight Elements
- Adds red outline to matching elements
- Places numbered labels on each match
- Shows element count in status bar

### Element Information
For each matched element, you'll see:
- **Tag Name**: The HTML tag
- **ID**: Element ID (if present)
- **Classes**: CSS classes applied
- **Attributes**: All HTML attributes
- **Text Content**: Preview of element text
- **Position**: Element coordinates and size
- **Visibility**: Whether the element is visible

## Technical Details

### Files Structure
```
selector-verifier/
├── manifest.json          # Extension configuration
├── devtools.html          # DevTools page entry point
├── devtools.js            # DevTools panel creation
├── panel.html             # Main UI interface with compact/full modes
├── panel.js               # Panel functionality with mode switching
├── content_script.js      # Page interaction script
└── icons/
    └── icon48.png         # Extension icon
```

### Browser Compatibility
- Chrome 88+
- Manifest V3 compatible
- Works on all websites (with appropriate permissions)

## Development

### Project Setup
1. Clone the repository
2. Make your changes to the source files
3. Reload the extension in `chrome://extensions/`
4. Open DevTools and check the console for any error messages
5. Test in the "Selector Verifier" tab

### Debugging
- Open DevTools console (F12 → Console) to see extension logs
- Look for messages starting with "DevTools script loaded" and "Selector Verifier panel created"
- If you see errors, check file permissions and paths

### Adding Features
- Modify `panel.html` for UI changes
- Update `panel.js` for functionality
- Edit `content_script.js` for page interaction
- Update `manifest.json` for permissions

## Troubleshooting

### Extension Not Appearing
- Ensure Developer mode is enabled
- Check that all files are in the correct location
- Reload the extension if you made changes

### DevTools Panel Missing
- Refresh the webpage
- Close and reopen DevTools
- Check the browser console for errors in the DevTools console itself (F12 → Console)
- Reload the extension in `chrome://extensions/`
- Look for "Selector Verifier" in the main DevTools tabs

### Need Sidebar-like Experience
- Use "Compact Mode" in the main panel for a sidebar-like layout
- Click the "📱 Compact Mode" button to switch to a narrower interface
- This works reliably across all Chrome versions unlike the native sidebar API

### Selectors Not Working
- Verify CSS selector syntax
- Check if elements exist on the current page
- Ensure content script has loaded properly

### Highlights Not Clearing
- Try refreshing the page
- Check for JavaScript errors in console
- Use the "Clear Highlights" button

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have feature requests, please:
1. Check the troubleshooting section
2. Look for existing issues in the repository
3. Create a new issue with detailed information

## Version History

- **v1.0.0**: Initial release
  - Basic selector testing
  - Element highlighting
  - DevTools main panel integration
  - Detailed element analysis
  - Auto-clipboard detection
  - Keyboard shortcuts
  - Selected element integration
  - Compact mode for sidebar-like experience

---

Made with ❤️ for web developers who love precision in their CSS selectors!