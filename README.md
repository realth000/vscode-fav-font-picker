# Favorite font picker

Switch fonts in vscode.

## Features

**CAUTION: Running step 2 will overwrite the font family settings (editor.fontFamily) in settings.json**

1. Save settings in `settings.json` for this extension:
  ```json
  "favFontPicker.favFonts": [
    "My Favorite Font 1",
    "My Favorite Font 2",
    "My Favorite Font 3"
  ],
  ```
  Optionally, set fallback fonts:
  ```json
  "favFontPicker.favFonts": [
    "My Favorite Fallback Font 1",
    "My Favorite Fallback Font 2",
    "My Favorite Fallback Font 3"
  ],
  ```
2. Open the command palette (default shortcut `Ctrl+Shift+p`), run `Pick favorite font` to select font or `Pick favorite fallback font` to select fallback font.
  * Note that after picking fonts, the value of `editor.fontFamily` in `settings.json` is overwritten.

## Requirements

All fonts to pick shall be installed on the machine. This extension never provides or download fonts.

## Extension Settings

### favFontPicker.favFonts

* Fonts to pick.
* Type: `string[]`.

### favFontPicker.favFallbackFonts

* Fonts to pick, will be applied as fallback font.
* Type: `string[]`.

## Known Issues

Head to [the issue tracker](https://github.com/realth000/vscode-fav-font-picker/issues) to check and report issue.

## Release Notes

### 0.0.1

Initial release.

