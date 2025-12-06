# Indentation Conversion: Spaces to Tabs

## Changes Made

1. **`.editorconfig`** - Updated to use tabs instead of spaces
2. **`.prettierrc.json`** - Created Prettier config with tab settings
3. **`package.json`** - Added Prettier dependency and formatting scripts
4. **`convert-to-tabs.js`** - Script to convert existing files

## Steps to Convert Your Project

### Option 1: Using the Conversion Script (Recommended)

```bash
# Run the conversion script
node convert-to-tabs.js
```

This will convert all `.ts`, `.html`, `.css`, `.scss`, and `.json` files in the `src` directory.

### Option 2: Using Prettier (After Installing)

```bash
# Install Prettier
npm install

# Format all files with tabs
npm run format
```

### Option 3: Manual VS Code Conversion

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Convert Indentation to Tabs"
4. Select all files in the `src` folder and run the command

## Verify the Changes

```bash
# Check formatting
npm run format:check
```

## Future Development

All new files will automatically use tabs because:
- `.editorconfig` is configured for tabs
- `.prettierrc.json` enforces tabs
- Your IDE will respect these settings

## VS Code Settings (Optional)

Add to `.vscode/settings.json`:

```json
{
	"editor.insertSpaces": false,
	"editor.tabSize": 2,
	"editor.detectIndentation": false
}
```
