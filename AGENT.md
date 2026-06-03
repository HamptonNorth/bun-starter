Ah, got it! No worries at all. Honestly, your edited version of `AGENT.md` is incredibly solid. You already caught the critical bits by updating the version tracking comment to target `Qwen3 Coder Next` and shifting the example interaction pattern from Claude to `AGENT`.

The core structure is perfectly fine, but since you are working specifically with a **Qwen-coder** model now, there are 3 minor tweaks you should consider adding to this file to get the absolute best performance out of it.

---

## 3 Recommended Tweaks for Qwen3-coder-next

### 1. Tighten the Code Modification Rule

Qwen models are incredibly efficient, but when code files get long, they love to use ellipsis (`// ... rest of the code`) to save space. While your file specifies providing a complete version, adding a microscopic constraint prevents it from getting lazy on large client components.

### 2. Explicitly Warn Against "Ghost" Packages

Because Qwen is trained extensively on standard Node.js ecosystems, it might occasionally default to suggesting an external npm package for things Bun does out of the box (like `dotenv` or `fs-extra`). Explicitly reminding it to use Bun built-ins keeps your workspace clean.

### 3. Handle CSS Nesting and Custom Properties

You have a brilliant Tailwind 4.1+ `@theme` configuration block in there. Qwen knows CSS inside and out, but explicitly telling it that it can use native CSS nesting and Tailwind v4's direct `@theme` utility ensures it won't write outdated v3 code.

---

## The Optimized `AGENT.md`

Here is the fully polished version containing those minor safety guardrails built-in:

```markdown
# AGENT.md
# version 0.1.1 dated 2026-06-03
# Project context for Agents / AI assistants (Qwen3-coder-next optimized)

## Development Stack

- **Runtime**: Bun 1.3+ (not Node.js)
- **Language**: JavaScript (ES6 modules) - NOT TypeScript
- **Architecture**: Combined client-server Bun approach
- **Styling**: Tailwind CSS 4.1+ (inline classes preferred)
- **Database**: SQLite for persistent storage
- **Authentication**: better-auth library

## Code Style Preferences

### General Principles

1. **Readability over brevity** - Favour easy to understand code over concise code
2. **Maintainability** - Structure code for easy maintenance
3. **Comments** - Add comments to explain structure and code generated
4. **Help improve** - Help me improve my coding whenever possible

### Version Tracking

Always add a comment at the head of each file and/or change snippet showing version and model:

```javascript
// version 1.0 Qwen3 Coder Next

```

### Output Format

* Use GitHub flavoured Markdown for responses (makes copy/paste to documentation straightforward)
* When modifying files: show both the changes AND a complete ready to 'copy and paste' version of the modified source file(s). **Never use `// ... rest of the code` placeholders.**

## Project Structure

```
./
├── server.js                    # Main Bun server (routes, API handlers)
├── .env                         # Environment variables
├── package.json
├── public/
│   ├── index.html
│   ├── pages-list.html          # Pages index/listing
│   ├── page-detail.html         # Individual page view/edit
│   ├── styles/
│   │   └── output.css           # Compiled Tailwind
│   ├── components/              # Custom Lit web components
│   │   ├── rm-button.js
│   │   ├── rm-nav-header.js
│   │   ├── rm-footer.js
│   │   ├── rm-markdown-editor.js
│   │   └── rm-image.js
│   ├── pages/                   # Markdown content by category
│   │   ├── start/
│   │   ├── technical/
│   │   └── {category}/
│   └── media/                   # Uploaded images by category
│       └── {category}/
├── routes/
│   └── api.js                   # API route handlers
├── models/                      # Database models
├── controllers/                 # Business logic
└── data/
    └── *.db                     # SQLite database files

```

## Custom Components (rm-* prefix)

When building UI, use existing custom components rather than rebuilding equivalent functionality:

| Component | Purpose |
| --- | --- |
| `<rm-button>` | Styled button with color/size variants |
| `<rm-nav-header>` | Site navigation header |
| `<rm-footer>` | Site footer with version info |
| `<rm-markdown-editor>` | View/edit modal for markdown with spellcheck |
| `<rm-image>` | Image display with carousel, positioning, text wrap |

All components are Lit-based web components styled with Tailwind CSS.

## Styling Guidelines

* **Client UI**: Use inline Tailwind CSS classes for views, modals, components
* **Components**: Import Lit from CDN: `https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm`
* **Markdown rendering**: Supports multiple CSS frameworks (GitHub, MCSS, Tailwind Typography, Pico, Water, Tufte, etc.)
* **Primary colour**: `#607d8b` The complete colour pallette is

```css
@theme {
  /* Primary Palette (Standard 50-900) */
  --color-primary-50: #eceff1;
  --color-primary-100: #cfd8dc;
  --color-primary-200: #b0bec5;
  --color-primary-300: #90a4ae;
  --color-primary-400: #78909c;
  --color-primary-500: #607d8b;
  --color-primary-600: #546e7a;
  --color-primary-700: #455a64;
  --color-primary-800: #37474f;
  --color-primary-900: #263238;

  /* Secondary Palette (Standard 50-900) */
  --color-secondary-50: #e3f2fd;
  --color-secondary-100: #bbdefb;
  --color-secondary-200: #90caf9;
  --color-secondary-300: #64b5f6;
  --color-secondary-400: #42a5f5;
  --color-secondary-500: #2196f3;
  --color-secondary-600: #1e88e5;
  --color-secondary-700: #1976d2;
  --color-secondary-800: #1565c0;
  --color-secondary-900: #0d47a1;

  /* Error Palette (Custom 1, 2) */
  /* No hyphen before number, matching JS logic */
  --color-error1: #b00020;
  --color-error2: #f36c60;

  /* Highlight Palette (Custom 1, 2, 3) */
  /* No hyphen before number, matching JS logic */
  --color-highlight1: #fff59d;
  --color-highlight2: #b2dfdb;
  --color-highlight3: #4db6ac;
}

```

## API Patterns

Server uses Bun.serve() with pattern-based routing:

```javascript
// Route structure in server.js
if (path.startsWith('/api/')) return handleApiRoutes(req, path)
if (path.startsWith('/auth/')) return auth.handler(req)
// Static files, HTML pages follow

```

Common API endpoints:

* `GET /api/pages` - List pages
* `GET /api/pages/:category/:slug` - Get page content
* `POST /api/pages` - Create/update page
* `GET /api/pages/search` - Full-text search (FTS5)
* `POST /api/spellcheck` - Spellcheck text (cspell)

## Database

* SQLite with Bun's built-in `bun:sqlite`
* FTS5 for full-text search
* better-auth manages user/session tables

## Key Technical Notes

### Import Chains

If working through import chains and imported code files are missing, **do not assume functionality** - ask for the relevant missing code files to be uploaded.

### Bun-specific

* Use `Bun.file()` for file operations (Do not suggest Node `fs` or `fs-extra`)
* Use `Bun.serve()` for server (Do not suggest Express/Fastify unless explicitly asked)
* Use `bun:sqlite` for database
* Build client components with `Bun.build()` at server startup
* Automatically read environment variables from `.env` via `process.env` or `Bun.env` (No `dotenv` package required)

### Front Matter

Markdown files use YAML front matter:

```yaml
---
title: Reading mode
summary: Use of reading mode with text heavy content
created: 2026-01-05
published: y
file-type: markdown
style: mcss-georgia-tight
sticky: false
read-mode: true
---

```

## Clarification Policy

Ask for clarification if anything is unclear or ambiguous. Don't make assumptions about:

* Missing file contents
* Unclear requirements
* Ambiguous implementation choices

## Example Interaction Pattern

Good request:

```
Update rm-button.js to add a 'loading' state with spinner

```

AGENT should:

1. Show the specific changes with context
2. Provide complete updated file ready for copy/paste
3. Include version comment header (e.g., `// version 1.1 Qwen3 Coder Next`)
4. Use GitHub Markdown formatting
5. Explain any improvements or suggestions

```

```