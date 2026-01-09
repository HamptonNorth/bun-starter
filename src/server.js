// version 18.2 Claude Sonnet 4.5
// =============================================================================
// CHANGES from v18.2:
// - FIX: FOUC (Flash of Unstyled Content) prevention using CSS preload
//        Style CSS now uses rel="preload" with onload conversion to stylesheet
//        Eliminates visible flash when markdown styles load
//
// CHANGES from v18.1:
// - FIX: Spellcheck now filters out issues in code blocks, inline code,
//        URLs, email addresses, markdown links/images, and HTML tags
//        (frontmatter IS spellchecked - add recurring terms to dictionary)
//
// CHANGES from v18.0:
// - REFACTOR: Style system moved to style-registry.js module
// - NEW: Support for many new markdown styles (Pico, Water, Tufte, etc.)
// - NEW: AVAILABLE_STYLES env var to control which styles are enabled
// - NEW: Google Fonts and CDN font loading for styles that require them
// - NEW: Style font links injected into SSR <head>
//
// CHANGES from v17.2:
// - NEW: Front matter 'read-mode: true' support for narrower prose reading
//        Sets meta.readMode boolean in SSR_DATA and API responses
//        Used by page-detail.html to apply 720px centered width
//
// CHANGES from v17.1:
// - FIX: Spellcheck API now uses spellCheckDocument + createTextDocument
//        (spellCheckText never existed in cspell-lib)
// - FIX: Added missing 'marked' import for markdown parsing
// - FIX: Moved spellcheck routes BEFORE /api/ catch-all (routes were unreachable)
//
// CHANGES from v17.0:
// - NEW: Full-text search across all markdown pages using SQLite FTS5
// - NEW: POST /api/pages/reindex - Rebuild search index (admin only)
// - NEW: GET /api/pages/search?q=query - Search pages with weighted scoring
// - NEW: GET /api/pages/search-meta - Get index metadata (admin only)
// - NEW: Weighted search scoring (title=10, h1=6, body=1, etc.)
// - NEW: Prefix matching (left-to-right, word-start, case-insensitive)
// - NEW: Access control in search (unpublished for admin, private by email)
//
// CHANGES from v16.2:
// - Added md-tailwind.css for print-specific styling (tighter vertical spacing)
// - Tailwind style now loads CSS file for print optimization
//
// CHANGES from v16.1:
// - Added mcss-georgia-tight style (12pt base, compact typography)
//
// CHANGES from v16.0:
// - NEW: PAGE_CONFIG env variable replaces PAGES for category configuration
// - NEW: JSON format for category->style->sidebar mapping
// - NEW: Extensible style system via style-registry.js
// - NEW: Style config exposed via /api/pages-config and /api/styles-config
// - NEW: Dynamic style class application in SSR
// - DEPRECATED: Old PAGES env format (still supported for backwards compat)
//
// PAGE_CONFIG Format:
// PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia"}'
// Format: {"category":"style[:sidebar]", ...}
//
// AVAILABLE_STYLES Format:
// AVAILABLE_STYLES="github","mcss-georgia","pico","tufte"
// Comma-separated, quoted style names. If not set, all styles are available.
//
// CHANGES from v15.0:
// - Added POST /api/pages/upload/:category - Upload markdown files (admin only)
// - Added POST /api/media/upload/:category - Upload image files (admin only)
// - Auto-adds default front matter to uploaded .md files without front matter
// - Always sets published: n on uploaded .md files to force review
//
// CHANGES from v14.5:
// - Added GET /api/pages/raw/:category/:slug - Returns raw markdown content (admin only)
// - Added PUT /api/pages/raw/:category/:slug - Saves markdown content (admin only)
// - Refactored route handling for clarity
//
import { auth } from './auth.js'
import { db } from './db-setup.js'
import { handleApiRoutes } from './routes/api.js'
import { readdir, watch } from 'node:fs/promises'
import { marked } from 'marked'

// =============================================================================
// STYLE REGISTRY IMPORT
// =============================================================================
import {
  buildStyleRegistry,
  getStyleConfig as getStyleConfigFromRegistry,
  getAvailableStyles as getAvailableStylesFromRegistry,
  getStyleChoices,
  getFontLinks,
} from './style-registry.js'

// Build the filtered style registry based on AVAILABLE_STYLES env var
const STYLE_REGISTRY = buildStyleRegistry()

// Log available styles at startup
console.log(`[Styles] Available styles: ${Object.keys(STYLE_REGISTRY).join(', ')}`)

// =============================================================================
// SEARCH SERVICE IMPORT
// =============================================================================
import {
  initSearchIndex,
  reindexAllPages,
  searchPages,
  getSearchMeta,
} from './services/pages-search.js'

// =============================================================================
// Spellcheck
// =============================================================================
import * as cspell from 'cspell-lib'

// Destructure the correct functions from cspell-lib
// Note: spellCheckText doesn't exist - use spellCheckDocument with createTextDocument
const { spellCheckDocument, createTextDocument, readSettings, mergeSettings } = cspell

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export { db }

// Initialize Custom Dictionary Table
db.run(`
  CREATE TABLE IF NOT EXISTS custom_dictionary (
    word TEXT PRIMARY KEY,
    added_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const PORT = process.env.PORT || 3000

// =============================================================================
// INITIALIZE SEARCH INDEX
// =============================================================================
// Creates FTS5 tables if they don't exist
initSearchIndex(db)

// =============================================================================
// STYLE HELPER FUNCTIONS
// =============================================================================

/**
 * Get style configuration by name
 * Falls back to 'tailwind' if style not found
 *
 * @param {string} styleName - Name of the style to look up
 * @returns {Object} Style configuration object
 */
function getStyleConfig(styleName) {
  return getStyleConfigFromRegistry(styleName, STYLE_REGISTRY)
}

/**
 * Get all registered style names
 *
 * @returns {string[]} Array of available style names
 */
function getAvailableStyles() {
  return getAvailableStylesFromRegistry(STYLE_REGISTRY)
}

// --- BUILD STEP (Client Components Only) ---
const buildResult = await Bun.build({
  entrypoints: ['./src/client-components-build.js'],
  outdir: './public/components',
  naming: 'client-components.js',
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.TEMP_PASSWORD_LAPSE_HOURS': JSON.stringify(
      process.env.TEMP_PASSWORD_LAPSE_HOURS || '48',
    ),
    APP_VERSION: JSON.stringify(process.env.VERSION || '0.0.0'),
  },
})
if (!buildResult.success) console.error('Build failed:', buildResult.logs)

// --- HOT RELOAD WATCHER ---
const clients = new Set()
const pagesWatcher = watch('./public/pages', { recursive: true })
;(async () => {
  try {
    for await (const event of pagesWatcher) {
      const filename = event.filename
      if (!filename) continue
      for (const controller of clients) controller.enqueue(`data: reload\n\n`)
    }
  } catch (e) {}
})()

// --- SERVER ---
//

const server = Bun.serve({
  port: PORT,
  idleTimeout: 255,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // UPDATED: Pass both /api/auth and /api/admin to the better-auth handler
    // This allows the admin plugin to handle the list-users request
    if (path.startsWith('/api/auth') || path.startsWith('/api/admin')) return auth.handler(req)

    if (path === '/api/hot-reload') {
      return new Response(
        new ReadableStream({
          start(c) {
            clients.add(c)
          },
          cancel(c) {
            clients.delete(c)
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        },
      )
    }

    // =========================================================================
    // CONFIGURATION API ENDPOINTS
    // =========================================================================

    if (path === '/api/pages-config') {
      return Response.json(getPagesConfig())
    }

    if (path === '/api/styles-config') {
      return Response.json({
        styles: STYLE_REGISTRY,
        available: getAvailableStyles(),
        choices: getStyleChoices(STYLE_REGISTRY),
      })
    }

    // =========================================================================
    // SEARCH API ENDPOINTS
    // GET /api/pages/search?q=query - Search across all pages
    // POST /api/pages/reindex - Rebuild search index (admin only)
    // GET /api/pages/search-meta - Get index metadata (admin only)
    // =========================================================================

    if (path === '/api/pages/search' && req.method === 'GET') {
      return handlePagesSearch(req, url)
    }

    if (path === '/api/pages/reindex' && req.method === 'POST') {
      return handlePagesReindex(req)
    }

    if (path === '/api/pages/search-meta' && req.method === 'GET') {
      return handleSearchMeta(req)
    }

    // =========================================================================
    // RAW MARKDOWN API ENDPOINTS (for editor)
    // GET /api/pages/raw/:category/:slug - Get raw markdown content
    // PUT /api/pages/raw/:category/:slug - Save markdown content
    // =========================================================================
    if (path.startsWith('/api/pages/raw/')) {
      if (req.method === 'GET') {
        return handleGetRawMarkdown(req, path)
      }
      if (req.method === 'PUT') {
        return handleSaveRawMarkdown(req, path)
      }
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // =========================================================================
    // FILE UPLOAD ENDPOINTS
    // POST /api/pages/upload/:category - Upload markdown file
    // POST /api/media/upload/:category - Upload image file
    // =========================================================================
    if (path.startsWith('/api/pages/upload/') && req.method === 'POST') {
      return handleMarkdownUpload(req, path)
    }
    if (path.startsWith('/api/media/upload/') && req.method === 'POST') {
      return handleMediaUpload(req, path)
    }

    if (path.startsWith('/api/pages/list/')) return handlePagesList(req, path)
    if (path.startsWith('/api/pages/content/')) return handlePageContent(req, path)

    // =========================================================================
    // SPELLCHECK API ENDPOINTS (must be before /api/ catch-all)
    // =========================================================================
    if (path === '/api/spellcheck' && req.method === 'POST') {
      return handleSpellCheck(req)
    }
    if (path === '/api/dictionary/add' && req.method === 'POST') {
      return handleAddtoDictionary(req)
    }

    // Catch-all for other /api/ routes
    if (path.startsWith('/api/')) return handleApiRoutes(req, path)

    if (path === '/components/client-components.js')
      return new Response(Bun.file('./public/components/client-components.js'), {
        headers: { 'Content-Type': 'text/javascript' },
      })

    if (
      path.startsWith('/styles/') ||
      path.startsWith('/scripts/') ||
      path.startsWith('/media/') ||
      path.startsWith('/docs/')
    )
      return serveStatic(path)

    if (path === '/favicon.ico')
      return new Response(Bun.file('./favicon.ico'), {
        headers: { 'Content-Type': 'image/x-icon' },
      })

    if (path === '/') return serveHtmlPage('./public/index.html')

    // --- PAGE VIEWS with SSR ---
    if (path.startsWith('/pages/')) {
      const parts = path.split('/').filter((p) => p.length > 0)
      if (parts.length === 2) return serveHtmlPage('./public/views/pages-list.html')
      if (parts.length === 3) return servePageDetailSSR(req, parts[1], parts[2])
    }

    return serveHtmlPage('./public/views' + path)
  },
})

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Parse PAGE_CONFIG environment variable
 *
 * Supports two formats:
 *
 * NEW FORMAT (recommended):
 * PAGE_CONFIG='{"start":"github","technical":"github:sidebar","rants":"mcss-georgia"}'
 *
 * LEGACY FORMAT (backwards compatible):
 * PAGES="start,technical:sidebar,rants"
 *
 * Returns array of: { name, style, sidebar }
 */
function getPagesConfig() {
  // Try new JSON format first
  const pageConfig = process.env.PAGE_CONFIG
  if (pageConfig) {
    try {
      const config = JSON.parse(pageConfig)
      return Object.entries(config).map(([name, value]) => {
        // Value can be "style" or "style:sidebar"
        const parts = value.split(':')
        const style = parts[0].trim()
        const sidebar = parts.length > 1 && parts[1].trim() === 'sidebar'

        // Get full style config
        const styleConfig = getStyleConfig(style)

        return {
          name: name.trim(),
          style: styleConfig.name,
          styleConfig: styleConfig,
          sidebar: sidebar,
        }
      })
    } catch (e) {
      console.error('Error parsing PAGE_CONFIG:', e.message)
      // Fall through to legacy format
    }
  }

  // Legacy format: PAGES="start,technical:sidebar,rants"
  const pagesEnv = process.env.PAGES || ''
  return pagesEnv
    .split(',')
    .map((c) => {
      const t = c.trim()
      if (!t) return null
      const p = t.split(':')
      const name = p[0].trim()
      const sidebar = p.length > 1 && p[1].trim() === 'sidebar'

      // Legacy format defaults to 'tailwind' style
      const styleConfig = getStyleConfig('tailwind')

      return {
        name: name,
        style: styleConfig.name,
        styleConfig: styleConfig,
        sidebar: sidebar,
      }
    })
    .filter((c) => c !== null)
}

/**
 * Get the style for a specific category
 * Checks PAGE_CONFIG first, then falls back to default
 */
function getCategoryStyle(category) {
  const config = getPagesConfig()
  const categoryConfig = config.find((c) => c.name === category)
  return categoryConfig ? categoryConfig.styleConfig : getStyleConfig('tailwind')
}

function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { attributes: {}, body: text }
  const attributes = {}
  const yamlLines = match[1].split('\n')
  yamlLines.forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      attributes[key] = value
    }
  })
  const body = text.replace(match[0], '').trim()
  return { attributes, body }
}

/**
 * Build an array of character ranges to skip for spellchecking
 * (code blocks, inline code, URLs, etc. - NOT frontmatter)
 * @param {string} text - The full text content
 * @returns {Array<{start: number, end: number}>} - Merged skip ranges
 */
function buildSkipRanges(text) {
  const skipPatterns = [
    // Fenced code blocks
    { regex: /```[\s\S]*?```/g, flags: 'g' },
    // Inline code
    { regex: /`[^`]+`/g, flags: 'g' },
    // URLs
    { regex: /https?:\/\/[^\s\])<>]+/gi, flags: 'gi' },
    // Email addresses
    { regex: /[\w.-]+@[\w.-]+\.\w+/gi, flags: 'gi' },
    // Markdown images
    { regex: /!\[[^\]]*\]\([^)]+\)/g, flags: 'g' },
    // Markdown links
    { regex: /\[[^\]]*\]\([^)]+\)/g, flags: 'g' },
    // HTML tags
    { regex: /<[^>]+>/g, flags: 'g' },
  ]

  const skipRanges = []

  for (const pattern of skipPatterns) {
    const regex = new RegExp(pattern.regex.source, pattern.flags || pattern.regex.flags)
    let match
    while ((match = regex.exec(text)) !== null) {
      skipRanges.push({ start: match.index, end: match.index + match[0].length })
      // For non-global regex, break after first match
      if (!regex.global) break
    }
  }

  // Sort by start position
  skipRanges.sort((a, b) => a.start - b.start)

  // Merge overlapping ranges
  const merged = []
  for (const range of skipRanges) {
    if (merged.length === 0 || merged[merged.length - 1].end < range.start) {
      merged.push({ ...range })
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end)
    }
  }

  return merged
}

/**
 * Check if a position falls within any skip range
 * @param {number} offset - Character offset to check
 * @param {Array<{start: number, end: number}>} skipRanges - Ranges to skip
 * @returns {boolean}
 */
function isInSkipRange(offset, skipRanges) {
  for (const range of skipRanges) {
    if (offset >= range.start && offset < range.end) return true
    if (range.start > offset) break // Ranges are sorted, no need to check further
  }
  return false
}

/**
 * POST /api/spellcheck
 * Runs CSpell against provided text using .cspell.json + SQLite words
 */
async function handleSpellCheck(req) {
  try {
    const { text, filename } = await req.json()
    if (!text) {
      return Response.json({ issues: [] })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Load base settings from cspell.json
    const configPath = join(__dirname, '../cspell.json')
    let baseSettings = await readSettings(configPath)

    // Get custom words from SQLite
    const customWords = db
      .query('SELECT word FROM custom_dictionary')
      .all()
      .map((row) => row.word)

    // Merge custom words into settings
    const finalSettings = mergeSettings(baseSettings, {
      words: customWords,
    })

    // Create a text document for spellchecking
    const doc = createTextDocument({
      uri: filename || 'untitled.md',
      content: text,
      languageId: 'markdown',
    })

    // Perform spellcheck
    const result = await spellCheckDocument(doc, { generateSuggestions: true }, finalSettings)

    // Build skip ranges for markdown elements we don't want to spellcheck
    const skipRanges = buildSkipRanges(text)

    // Transform and filter issues - exclude those in skip ranges
    const issues = result.issues
      .filter((issue) => !isInSkipRange(issue.offset, skipRanges))
      .map((issue) => ({
        text: issue.text,
        offset: issue.offset,
        line: issue.line?.offset || 0,
        suggestions: issue.suggestions?.slice(0, 5) || [],
      }))

    return Response.json({ issues })
  } catch (err) {
    console.error('[Spellcheck] Error:', err)
    return Response.json({ error: 'Spellcheck failed', details: err.message }, { status: 500 })
  }
}

/**
 * POST /api/dictionary/add
 * Add a word to the custom dictionary (SQLite)
 */
async function handleAddtoDictionary(req) {
  try {
    const { word } = await req.json()

    if (!word || typeof word !== 'string') {
      return Response.json({ error: 'Word is required' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Clean the word
    const cleanWord = word.trim().toLowerCase()
    if (cleanWord.length === 0) {
      return Response.json({ error: 'Invalid word' }, { status: 400 })
    }

    // Insert into dictionary (ignore if already exists)
    db.run(
      `INSERT OR IGNORE INTO custom_dictionary (word, added_by) VALUES (?, ?)`,
      cleanWord,
      session.user.email,
    )

    console.log(`[Dictionary] Added word "${cleanWord}" by ${session.user.email}`)

    return Response.json({ success: true, word: cleanWord })
  } catch (err) {
    console.error('[Dictionary] Error:', err)
    return Response.json({ error: 'Failed to add word', details: err.message }, { status: 500 })
  }
}

// =============================================================================
// SSR PAGE DETAIL RENDERING
// =============================================================================

async function servePageDetailSSR(req, category, slug) {
  const templatePath = './public/views/page-detail.html'
  const templateFile = Bun.file(templatePath)
  if (!(await templateFile.exists())) return serve404()

  let html = await templateFile.text()

  const mdPath = `./public/pages/${category}/${slug}.md`
  const mdFile = Bun.file(mdPath)

  let meta = {}
  let contentHtml = ''
  let found = false

  if (await mdFile.exists()) {
    const text = await mdFile.text()
    const parsed = parseFrontMatter(text)
    meta = parsed.attributes
    contentHtml = marked.parse(parsed.body)
    found = true
  }

  const session = await auth.api.getSession({ headers: req.headers })
  const isAdmin = session?.user?.role === 'admin'
  const userEmail = session?.user?.email

  if (found) {
    if (meta.published === 'n' && !isAdmin) {
      contentHtml = `<div class="bg-red-50 p-4 text-red-700 rounded">Access Denied: Unpublished content.</div>`
      meta.title = 'Access Denied'
    } else if (meta.lapse && new Date() > new Date(meta.lapse)) {
      contentHtml = `<div class="bg-amber-50 p-4 text-amber-700 rounded">This content has expired.</div>`
      meta.title = 'Expired Content'
    } else if (meta.private && (!userEmail || userEmail !== meta.private)) {
      contentHtml = `<div class="bg-red-50 p-4 text-red-700 rounded">Access Denied: Private content.</div>`
      meta.title = 'Private Content'
    }
  }

  const config = getPagesConfig()
  const pageTitle = meta.title || 'Untitled'

  const escapedTitle = pageTitle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  let dateHtml = ''
  if (meta.created) {
    const d = new Date(meta.created)
    if (!isNaN(d)) {
      dateHtml = d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // =========================================================================
  // STYLE DETERMINATION - Priority: Front matter > Category default > Tailwind
  // =========================================================================
  const categoryConfig = config.find((c) => c.name === category)
  const categoryDefaultStyle = categoryConfig ? categoryConfig.style : 'tailwind'

  // Front matter 'style' key takes priority over category default
  const effectiveStyleName = meta.style || categoryDefaultStyle
  const styleConfig = getStyleConfig(effectiveStyleName)

  // =========================================================================
  // READ MODE - Narrower width for prose-heavy content
  // Front matter: read-mode: true (defaults to false)
  // =========================================================================
  const readModeValue = meta['read-mode']
  meta.readMode = readModeValue === true || readModeValue === 'true'

  // =========================================================================
  // INJECT CONFIGURATION SCRIPTS
  // =========================================================================
  const configScript = `<script>
window.SERVER_PAGES_CONFIG = ${JSON.stringify(config)};
window.SSR_DATA = ${JSON.stringify(meta)};
window.STYLE_REGISTRY = ${JSON.stringify(STYLE_REGISTRY)};
window.EFFECTIVE_STYLE = ${JSON.stringify(styleConfig)};
</script>`
  html = html.replace('</head>', `${configScript}</head>`)

  // =========================================================================
  // INJECT FONT LINKS (Google Fonts, CDN fonts)
  // =========================================================================
  const fontLinks = getFontLinks(styleConfig)
  if (fontLinks.length > 0) {
    const fontLinkTags = fontLinks
      .map((url) => `<link rel="stylesheet" href="${url}" />`)
      .join('\n    ')
    // Add preconnect for Google Fonts performance
    const preconnects = fontLinks.some((url) => url.includes('googleapis.com'))
      ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
      : ''
    html = html.replace('</head>', `${preconnects}\n    ${fontLinkTags}\n</head>`)
  }

  // =========================================================================
  // INJECT STYLE CSS FILE (if needed) - WITH PRELOAD TO PREVENT FOUC
  // =========================================================================
  if (styleConfig.cssFile) {
    const cssPath = `/styles/md-styles/${styleConfig.cssFile}`

    // Use rel="preload" with immediate stylesheet conversion to prevent FOUC
    // The onload handler changes rel to stylesheet once loaded
    // Noscript fallback for browsers with JS disabled
    const preloadLink = `<link rel="preload" href="${cssPath}" as="style" onload="this.onload=null;this.rel='stylesheet'" />`
    const noscriptFallback = `<noscript><link rel="stylesheet" href="${cssPath}" /></noscript>`

    html = html.replace('</head>', `${preloadLink}\n    ${noscriptFallback}\n</head>`)
  }

  // =========================================================================
  // APPLY STYLE CLASSES TO MARKDOWN CONTAINER
  // =========================================================================
  // The HTML has: id="markdown-content" class="prose prose-slate ..."
  // We need to:
  // 1. If removeProse is true, remove the prose classes
  // 2. Add the style's wrapper class

  if (styleConfig.removeProse) {
    // Remove prose classes and add style wrapper class
    html = html.replace(
      /id="markdown-content"\s+class="[^"]*prose[^"]*"/,
      `id="markdown-content" class="${styleConfig.wrapperClass}"`,
    )
  } else {
    // Keep prose classes and add additional wrapper class
    html = html.replace(
      /id="markdown-content"\s+class="([^"]*)"/,
      `id="markdown-content" class="$1 ${styleConfig.wrapperClass}"`,
    )
  }

  html = html.replace('{{PAGE_TITLE_ATTR}}', escapedTitle)
  html = html.replace('{{PAGE_TITLE_TEXT}}', escapedTitle)
  html = html.replace('{{PAGE_DATE}}', dateHtml)
  html = html.replace('<!--MARKDOWN_CONTENT-->', contentHtml)

  if (meta.private) {
    html = html.replace('id="private-badge" class="hidden', 'id="private-badge" class="')
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// =============================================================================
// SEARCH API HANDLERS
// =============================================================================

/**
 * GET /api/pages/search?q=query
 * Search across all indexed pages
 * Access control: filters unpublished (admin only) and private (email match)
 */
async function handlePagesSearch(req, url) {
  try {
    const query = url.searchParams.get('q') || ''
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : undefined

    // Get session for access control
    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email || null

    // Perform search with access control
    const results = searchPages(db, query, {
      isAdmin,
      userEmail,
      limit,
    })

    return Response.json(results)
  } catch (err) {
    console.error('[Search] API error:', err)
    return Response.json({ error: 'Search failed', details: err.message }, { status: 500 })
  }
}

/**
 * POST /api/pages/reindex
 * Rebuild the search index from all markdown files
 * Requires admin role
 */
async function handlePagesReindex(req) {
  try {
    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    console.log(`[Search] Reindex triggered by ${session.user.email}`)

    // Perform reindex
    const result = await reindexAllPages(db, getPagesConfig)

    if (result.success) {
      return Response.json(result)
    } else {
      return Response.json(result, { status: 500 })
    }
  } catch (err) {
    console.error('[Search] Reindex API error:', err)
    return Response.json({ error: 'Reindex failed', details: err.message }, { status: 500 })
  }
}

/**
 * GET /api/pages/search-meta
 * Get search index metadata (last indexed time, document count)
 * Requires admin role
 */
async function handleSearchMeta(req) {
  try {
    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const meta = getSearchMeta(db)
    return Response.json(meta)
  } catch (err) {
    console.error('[Search] Meta API error:', err)
    return Response.json({ error: 'Failed to get metadata', details: err.message }, { status: 500 })
  }
}

// =============================================================================
// RAW MARKDOWN API HANDLERS
// =============================================================================

/**
 * GET /api/pages/raw/:category/:slug
 * Returns raw markdown content for editing
 * Requires admin role
 */
async function handleGetRawMarkdown(req, path) {
  try {
    // Parse category and slug from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]
    const slug = parts[4]

    // Validate inputs
    if (!category || !slug) {
      return Response.json({ error: 'Missing category or slug' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..') || slug.includes('..')) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Read the markdown file
    const mdPath = `./public/pages/${category}/${slug}.md`
    const mdFile = Bun.file(mdPath)

    if (!(await mdFile.exists())) {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    const content = await mdFile.text()
    const parsed = parseFrontMatter(content)

    return Response.json({
      raw: content,
      meta: parsed.attributes,
      body: parsed.body,
      category,
      slug,
    })
  } catch (err) {
    console.error('Error reading raw markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * PUT /api/pages/raw/:category/:slug
 * Saves markdown content
 * Requires admin role
 */
async function handleSaveRawMarkdown(req, path) {
  try {
    // Parse category and slug from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]
    const slug = parts[4]

    // Validate inputs
    if (!category || !slug) {
      return Response.json({ error: 'Missing category or slug' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..') || slug.includes('..')) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Get the new content from request body
    const { content } = await req.json()
    if (typeof content !== 'string') {
      return Response.json({ error: 'Content must be a string' }, { status: 400 })
    }

    // Write the file
    const mdPath = `./public/pages/${category}/${slug}.md`
    await Bun.write(mdPath, content)

    console.log(`[Admin] Markdown saved: ${mdPath} by ${session.user.email}`)

    return Response.json({
      success: true,
      message: 'File saved successfully',
      path: mdPath,
    })
  } catch (err) {
    console.error('Error saving markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// =============================================================================
// FILE UPLOAD HANDLERS
// =============================================================================

// Allowed file extensions for uploads
const ALLOWED_MARKDOWN_EXTENSIONS = ['.md']
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

/**
 * Get file extension (lowercase)
 */
function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Sanitize filename - remove problematic characters
 */
function sanitizeFilename(filename) {
  // Keep alphanumeric, dash, underscore, dot
  // Replace spaces with dashes
  // Remove any path separators
  return filename
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove other special chars
    .replace(/--+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Trim leading/trailing dashes
    .toLowerCase()
}

/**
 * Ensure front matter exists with published: n
 * If no front matter, adds default. If front matter exists, sets published: n
 */
function ensureUnpublishedFrontMatter(content, category = 'general') {
  const hasFrontMatter = content.trim().startsWith('---')

  if (!hasFrontMatter) {
    // Add default front matter
    const today = new Date().toISOString().split('T')[0]

    // Get the default style for this category
    const categoryStyle = getCategoryStyle(category)
    const styleName = categoryStyle.name

    const defaultFrontMatter = `---
title: Untitled
summary:
created: ${today}
published: n
file-type: markdown
style: ${styleName}
---

`
    return defaultFrontMatter + content
  }

  // Has front matter - ensure published: n
  // Parse and rebuild
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return content

  let frontMatter = match[1]
  const body = content.slice(match[0].length)

  // Check if published key exists
  if (/^published\s*:/m.test(frontMatter)) {
    // Replace existing published value
    frontMatter = frontMatter.replace(/^(published\s*:\s*).*$/m, '$1n')
  } else {
    // Add published: n
    frontMatter = frontMatter.trim() + '\npublished: n'
  }

  return `---\n${frontMatter}\n---${body}`
}

/**
 * POST /api/pages/upload/:category
 * Upload a markdown file
 * Requires admin role
 */
async function handleMarkdownUpload(req, path) {
  try {
    // Parse category from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]

    // Validate category
    if (!category) {
      return Response.json({ error: 'Missing category' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..')) {
      return Response.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file extension
    const ext = getFileExtension(file.name)
    if (!ALLOWED_MARKDOWN_EXTENSIONS.includes(ext)) {
      return Response.json(
        {
          error: `Invalid file type. Allowed: ${ALLOWED_MARKDOWN_EXTENSIONS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName || sanitizedName === '.md') {
      return Response.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Build target path
    const targetDir = `./public/pages/${category}`
    const targetPath = `${targetDir}/${sanitizedName}`

    // Ensure directory exists
    const { mkdir } = await import('node:fs/promises')
    await mkdir(targetDir, { recursive: true })

    // Check if file already exists
    const targetFile = Bun.file(targetPath)
    if (await targetFile.exists()) {
      return Response.json(
        {
          error: `File "${sanitizedName}" already exists in ${category}`,
        },
        { status: 409 },
      )
    }

    // Get file content
    let content = await file.text()

    // Ensure front matter with published: n (pass category for default style)
    content = ensureUnpublishedFrontMatter(content, category)

    // Write the file
    await Bun.write(targetPath, content)

    console.log(`[Admin] Markdown file uploaded: ${targetPath} by ${session.user.email}`)

    return Response.json({
      success: true,
      message: `Markdown file "${sanitizedName}" uploaded successfully`,
      path: `pages/${category}/${sanitizedName}`,
      filename: sanitizedName,
    })
  } catch (err) {
    console.error('Error uploading markdown:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/media/upload/:category
 * Upload an image file
 * Requires admin role
 */
async function handleMediaUpload(req, path) {
  try {
    // Parse category from path
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]

    // Validate category
    if (!category) {
      return Response.json({ error: 'Missing category' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (category.includes('..')) {
      return Response.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Check authentication - admin only
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file extension
    const ext = getFileExtension(file.name)
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return Response.json(
        {
          error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName || sanitizedName === ext) {
      return Response.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Build target path
    const targetDir = `./public/media/${category}`
    const targetPath = `${targetDir}/${sanitizedName}`

    // Ensure directory exists
    const { mkdir } = await import('node:fs/promises')
    await mkdir(targetDir, { recursive: true })

    // Check if file already exists
    const targetFile = Bun.file(targetPath)
    if (await targetFile.exists()) {
      return Response.json(
        {
          error: `File "${sanitizedName}" already exists in ${category}`,
        },
        { status: 409 },
      )
    }

    // Get file buffer and write
    const buffer = await file.arrayBuffer()
    await Bun.write(targetPath, buffer)

    console.log(`[Admin] Media file uploaded: ${targetPath} by ${session.user.email}`)

    // Return the path that can be used in markdown
    const markdownPath = `/media/${category}/${sanitizedName}`

    return Response.json({
      success: true,
      message: `Image "${sanitizedName}" uploaded successfully`,
      path: `media/${category}/${sanitizedName}`,
      filename: sanitizedName,
      markdownUsage: `![${sanitizedName}](${markdownPath})`,
    })
  } catch (err) {
    console.error('Error uploading media:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

// --- API HANDLERS ---

async function handlePagesList(req, path) {
  try {
    const parts = path.split('/')
    const category = parts[parts.length - 1]
    if (category.includes('..'))
      return Response.json({ error: 'Invalid category' }, { status: 400 })

    const dirPath = `./public/pages/${category}`
    try {
      await readdir(dirPath)
    } catch (e) {
      return Response.json({ pages: [], category }, { status: 200 })
    }

    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email

    const files = await readdir(dirPath)
    const pages = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const content = await Bun.file(join(dirPath, file)).text()
      const { attributes: meta } = parseFrontMatter(content)

      if (!meta.title) continue
      meta.filename = file
      meta.slug = file.replace('.md', '')

      if (meta.published === 'n' && !isAdmin) continue
      if (meta.lapse && new Date() > new Date(meta.lapse)) continue
      if (meta.private && (!userEmail || userEmail !== meta.private)) continue

      pages.push(meta)
    }

    pages.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
    return Response.json({ pages, category })
  } catch (e) {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}

async function handlePageContent(req, path) {
  try {
    const parts = path.split('/').filter((p) => p.length > 0)
    const category = parts[3]
    const slug = parts[4]

    const mdPath = `./public/pages/${category}/${slug}.md`
    const mdFile = Bun.file(mdPath)

    let meta = {}
    let htmlContent = ''

    if (await mdFile.exists()) {
      const text = await mdFile.text()
      const parsed = parseFrontMatter(text)
      meta = parsed.attributes
      htmlContent = marked.parse(parsed.body)
    } else {
      return Response.json({ error: 'The markdon file requested was not found.' }, { status: 404 })
    }

    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const userEmail = session?.user?.email

    if (meta.published === 'n' && !isAdmin)
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    if (meta.lapse && new Date() > new Date(meta.lapse))
      return Response.json({ error: 'Expired' }, { status: 410 })
    if (meta.private && (!userEmail || userEmail !== meta.private))
      return Response.json({ error: 'Unauthorized' }, { status: 403 })

    // Include style information in response
    const config = getPagesConfig()
    const categoryConfig = config.find((c) => c.name === category)
    const categoryDefaultStyle = categoryConfig ? categoryConfig.style : 'tailwind'
    const effectiveStyleName = meta.style || categoryDefaultStyle
    const styleConfig = getStyleConfig(effectiveStyleName)

    // Parse read-mode from front matter (defaults to false)
    const readModeValue = meta['read-mode']
    meta.readMode = readModeValue === true || readModeValue === 'true'

    return Response.json({
      meta,
      html: htmlContent,
      style: styleConfig,
    })
  } catch (e) {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}

async function serveStatic(path) {
  const file = Bun.file(`./public${path}`)
  if (!(await file.exists())) return serve404()
  return new Response(file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
}

async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath)
  if (!(await pageFile.exists())) return serve404()
  return new Response(pageFile, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function serve404() {
  const notFoundFile = Bun.file(join(__dirname, '../public/views/404.html')) // Use absolute join
  if (await notFoundFile.exists())
    return new Response(notFoundFile, { status: 404, headers: { 'Content-Type': 'text/html' } })
  return new Response('Not Found', { status: 404 })
}

console.log(`\nServer running at http://localhost:${PORT}`)
