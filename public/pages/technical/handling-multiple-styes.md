---
title: Handling multiple CSS styles for markdown
summary: Notes for handling multiple CSS styles for pages content written in markdown.
created: 2025-12-26
published: y
file-type: markdown
style: github

---
# Extensible Markdown Styles System

## Overview

This system provides an extensible architecture for applying different CSS styles to markdown content. Adding a new style requires only:

1. Creating a CSS file
2. Adding an entry to the style registry
3. (Optional) Setting it as the default for categories in your `.env`

## Quick Start

### 1. Configure Categories (`.env`)

```bash
# New JSON format - map categories to styles and sidebar settings
PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia","docs":"mcss-verdana"}'
```

### 2. Override Style in Front Matter

Individual markdown files can override the category default:

```yaml
---
title: My Document
style: mcss-georgia
---
```

## Available Styles

The full list of available styles can be seen in the `.env` file. Note the administrator is expected to limit the available style to acheive a consistent side wide rendering of pages.

```javascript

AVAILABLE_STYLES="tailwind","github","mcss-georgia","mcss-verdana","mcss-georgia-tight",
"pico","water","water-dark","sakura","new-css","tufte","splendor","modest","retro","air"

```

The category `test-styles` provides a sample page for each style.

## Style Priority

Styles are determined in this order (highest priority first):

1. **Front matter `style:` key** - Set per-document
2. **Category default** - From `PAGE_CONFIG` in `.env`
3. **Tailwind** - Fallback default

## Adding a New Style

### Step 1: Create the CSS File

Create `/public/styles/md-styles/md-your-style.css`:

```css
/* 
/* =============================================================================
 * YOUR STYLE NAME
 * ============================================================================= */

/* Screen styles */
.md-your-style {
  font-family: 'Your Font', sans-serif;
  /* ... your styles ... */
}

/* Print styles - A4 optimized */
@media print {
  .md-your-style {
    font-size: 11pt;
    /* ... print overrides ... */
  }
}

@page {
  size: A4;
  margin: 2cm 2.5cm;
}
```

### Step 2: Add to Style Registry

In `server.js`, add to `STYLE_REGISTRY`:

```javascript
const STYLE_REGISTRY = {
  // ... existing styles ...

   // Modest: Clean sans-serif with Open Sans
   modest: {
     name: 'modest',
     label: 'Modest',
     cssFile: 'md-modest.css',
     wrapperClass: 'md-modest',
     removeProse: true,
     description: 'Rather modest styling with Open Sans font',
     googleFonts: ['Open+Sans:ital,wght@0,400;0,700;1,400;1,700'],
     cdnFonts: [],
   },
}
```

> Fonts may be loaded from Google Fonts or from a CDN.

### Step 3: Use Your Style

**In `.env`:**
```bash
PAGE_CONFIG='{"my-category":"your-style"}'
```

**In front matter:**
```yaml
---
title: My Document
style: your-style
---
```

That's it! The system will automatically:
- Load the CSS file when needed
- Apply the correct wrapper classes
- Use the style's print layout

## File Structure

```
public/
├── styles/
│   └── md-styles/
│       ├── style-registry.js    # Style configuration (client-side)
│       ├── md-github.css        # GitHub markdown style
│       ├── md-mcss-base.css     # Shared MCSS base styles
│       ├── md-mcss-georgia.css  # MCSS Georgia variant
│       └── md-mcss-verdana.css  # MCSS Verdana variant
├── views/
│   └── page-detail.html         # Updated page template
└── ...

server.js                        # Contains STYLE_REGISTRY
```

## API Endpoints

### GET `/api/pages-config`

Returns category configuration including style information:

```json
[
  {
    "name": "start",
    "style": "github",
    "styleConfig": { ... },
    "sidebar": false
  },
  {
    "name": "technical",
    "style": "github",
    "styleConfig": { ... },
    "sidebar": true
  }
]
```

### GET `/api/styles-config`

Returns all available styles:

```json
{
  "styles": {
    "tailwind": { ... },
    "github": { ... },
    "mcss-georgia": { ... },
    "mcss-verdana": { ... }
  },
  "available": ["tailwind", "github", "mcss-georgia", "mcss-verdana"]
}
```

### GET `/api/pages/content/:category/:slug`

Response now includes style information:

```json
{
  "meta": { ... },
  "html": "...",
  "style": {
    "name": "github",
    "cssFile": "md-github.css",
    "wrapperClass": "md-github",
    "removeProse": true
  }
}
```


## Print Support

All styles include A4 print optimization with:

- Clean page margins (2-2.5cm)
- Hidden navigation/UI elements
- Optimized font sizes for print
- Page break control
- Link URL display
- Code block wrapping

To print, use the Print button or `Ctrl/Cmd + P`.


### Style not applying?

1. Check the style name matches exactly (case-sensitive)
2. Verify the CSS file exists in `/public/styles/md-styles/`
3. Check browser console for CSS loading errors
4. Ensure `PAGE_CONFIG` is valid JSON

### Print layout issues?

1. Each style has its own `@media print` rules
2. Check browser print preview
3. Some browsers handle print differently - test in Chrome for best results

### Want to customize an existing style?

Create a copy with a new name rather than modifying the original:

```css
/* md-github-custom.css */
@import url('./md-github.css');

.md-github-custom {
  /* Your overrides */
}
```

Then add it to the registry as a new style.

### Example .env 

```text
# .env
PORT=3000

# Default admin user created on running
ADMIN_NAME=
ADMIN_EMAIL=
# ADMIN_PASSWORD must be at least 8 characters, contain at least 1 uppercase letter and at least 1 number
ADMIN_PASSWORD=
BETTER_AUTH_SECRET=
# URL of home page e.g. https://bunstarter.redmug.dev/
BETTER_AUTH_URL=

TEMP_PASSWORD_LAPSE_HOURS=48

# database name including extension
DATABASE_NAME=

# version 0.0.0
VERSION=0.8.9

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# On Github easier to have multiple CLIENT_ID and CLIENT_SECRET
# for dev http://localhost:3000/
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# for production https://bunstarter.redmug.dev/
#GITHUB_CLIENT_ID=
#GITHUB_CLIENT_SECRET=



# Pages - Multiple categories with different styles
# =============================================================================
# STYLE CONFIGURATION
# =============================================================================
# AVAILABLE_STYLES controls which markdown rendering styles are exposed
# to the application. Format: comma-separated, quoted style names.
#
# If not set or empty, ALL styles are available.
#
# Available style names:
# - Core styles: tailwind, github, mcss-georgia, mcss-verdana, mcss-georgia-tight
# - Classless CSS: pico, water, water-dark, sakura, new-css
# - Typography-focused: tufte, splendor, modest, retro, air
#
# Examples:
# AVAILABLE_STYLES="github","mcss-georgia","pico","tufte"
# AVAILABLE_STYLES="tailwind","github","splendor","modest"
#
# Full list (uncomment to enable all):
# AVAILABLE_STYLES="tailwind","github","mcss-georgia","mcss-verdana","mcss-georgia-tight","pico","water","water-dark","sakura","new-css","tufte","splendor","modest","retro","air"

AVAILABLE_STYLES="tailwind","github","mcss-georgia","pico","tufte"

# =============================================================================
# PAGE CONFIGURATION
# =============================================================================
# PAGE_CONFIG defines categories and their default styles.
# Format: JSON object { "category": "style[:sidebar]" }
#
# Examples:
# PAGE_CONFIG='{"docs":"github:sidebar","blog":"splendor","notes":"tufte"}'
# PAGE_CONFIG='{"start":"tailwind","technical":"github:sidebar","rants":"mcss-georgia"}'

PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"modest","test-styles":"github"}'

```
