// version 1.1 Claude Opus 4.5
// Fixed: Google Fonts API v2 URL format (ital,wght@ syntax)
// =============================================================================
// STYLE REGISTRY - Extensible markdown style configuration
// =============================================================================
// This module defines all available markdown rendering styles with their
// associated CSS files, wrapper classes, and font requirements.
//
// To add a new style:
// 1. Add entry to FULL_STYLE_REGISTRY below
// 2. Create CSS file in /public/styles/md-styles/
// 3. Add style name to AVAILABLE_STYLES in .env
// 4. (Optional) Add Google Font or CDN font requirements
//
// Font Requirements:
// - googleFonts: Array of Google Font family names (loaded via fonts.googleapis.com)
// - cdnFonts: Array of CDN URLs for font CSS files (e.g., ET Book for Tufte)
// =============================================================================

/**
 * Full registry of all possible markdown styles
 * Each style defines:
 * - name: Unique identifier (used in front matter and PAGE_CONFIG)
 * - label: Human-readable display name
 * - cssFile: CSS filename in /public/styles/md-styles/
 * - wrapperClass: CSS classes applied to the markdown container
 * - removeProse: If true, removes default Tailwind prose classes
 * - description: Brief description of the style
 * - googleFonts: (optional) Array of Google Font families to load
 * - cdnFonts: (optional) Array of CDN URLs for font CSS files
 */
export const FULL_STYLE_REGISTRY = {
  // =========================================================================
  // CORE STYLES (Original)
  // =========================================================================

  // Default: Tailwind Typography (prose) with print optimizations
  tailwind: {
    name: 'tailwind',
    label: 'Tailwind Prose',
    cssFile: 'md-tailwind.css',
    wrapperClass: 'prose prose-slate max-w-none',
    removeProse: false,
    description: 'Clean, modern styling using Tailwind Typography',
    googleFonts: [],
    cdnFonts: [],
  },

  // GitHub-flavored Markdown styling
  github: {
    name: 'github',
    label: 'GitHub Style',
    cssFile: 'md-github.css',
    wrapperClass: 'md-github',
    removeProse: true,
    description: 'GitHub README-style markdown rendering',
    googleFonts: [],
    cdnFonts: [],
  },

  // MCSS Georgia: Elegant serif typography
  'mcss-georgia': {
    name: 'mcss-georgia',
    label: 'MCSS Georgia',
    cssFile: 'md-mcss-georgia.css',
    wrapperClass: 'md-mcss md-mcss-georgia',
    removeProse: true,
    description: 'Elegant serif typography for long-form reading',
    googleFonts: [],
    cdnFonts: [],
  },

  // MCSS Verdana: Modern sans-serif typography
  'mcss-verdana': {
    name: 'mcss-verdana',
    label: 'MCSS Verdana',
    cssFile: 'md-mcss-verdana.css',
    wrapperClass: 'md-mcss md-mcss-verdana',
    removeProse: true,
    description: 'Modern sans-serif style for technical documentation',
    googleFonts: [],
    cdnFonts: [],
  },

  // MCSS Georgia Tight: Compact serif typography (12pt base)
  'mcss-georgia-tight': {
    name: 'mcss-georgia-tight',
    label: 'MCSS Georgia Tight',
    cssFile: 'md-mcss-georgia-tight.css',
    wrapperClass: 'md-mcss md-mcss-georgia-tight',
    removeProse: true,
    description: 'Compact serif typography with 12pt base for denser content',
    googleFonts: [],
    cdnFonts: [],
  },

  // =========================================================================
  // CLASSLESS CSS FRAMEWORKS
  // =========================================================================

  // Pico CSS: Minimal classless framework
  pico: {
    name: 'pico',
    label: 'Pico CSS',
    cssFile: 'md-pico.css',
    wrapperClass: 'md-pico',
    removeProse: true,
    description: 'Minimal classless CSS framework with elegant defaults',
    googleFonts: [],
    cdnFonts: [],
  },

  // Water.css: Classless CSS framework
  water: {
    name: 'water',
    label: 'Water CSS',
    cssFile: 'md-water.css',
    wrapperClass: 'md-water',
    removeProse: true,
    description: 'Simple classless CSS for quick styling',
    googleFonts: [],
    cdnFonts: [],
  },

  // Water.css Dark: Dark theme variant
  'water-dark': {
    name: 'water-dark',
    label: 'Water CSS (Dark)',
    cssFile: 'md-water-dark.css',
    wrapperClass: 'md-water md-water-dark',
    removeProse: true,
    description: 'Water CSS with dark theme',
    googleFonts: [],
    cdnFonts: [],
  },

  // Sakura CSS: Minimal classless CSS
  sakura: {
    name: 'sakura',
    label: 'Sakura CSS',
    cssFile: 'md-sakura.css',
    wrapperClass: 'md-sakura',
    removeProse: true,
    description: 'Minimal classless CSS with cherry blossom aesthetics',
    googleFonts: [],
    cdnFonts: [],
  },

  // new.css: Modern classless CSS
  'new-css': {
    name: 'new-css',
    label: 'new.css',
    cssFile: 'md-new-css.css',
    wrapperClass: 'md-new-css',
    removeProse: true,
    description: 'Modern classless CSS that uses system fonts',
    googleFonts: [],
    cdnFonts: [],
  },

  // =========================================================================
  // TUFTE STYLE (Requires ET Book Font)
  // =========================================================================

  // Tufte CSS: Edward Tufte-inspired styling
  tufte: {
    name: 'tufte',
    label: 'Tufte Style',
    cssFile: 'md-tufte.css',
    wrapperClass: 'md-tufte',
    removeProse: true,
    description: 'Edward Tufte-inspired design with sidenotes and elegant typography',
    googleFonts: [],
    // ET Book font from CDN - used by Tufte CSS
    cdnFonts: ['https://cdnjs.cloudflare.com/ajax/libs/tufte-css/1.8.0/tufte.min.css'],
  },

  // =========================================================================
  // MARKDOWNCSS STYLES (from markdowncss.github.io)
  // =========================================================================

  // Splendor: Elegant serif style with Merriweather
  splendor: {
    name: 'splendor',
    label: 'Splendor',
    cssFile: 'md-splendor.css',
    wrapperClass: 'md-splendor',
    removeProse: true,
    description: 'Absolutely splendid serif styling with Merriweather font',
    googleFonts: ['Merriweather:ital,wght@0,400;0,700;1,400;1,700'],
    cdnFonts: [],
  },

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

  // Retro: Nostalgic monospace styling
  retro: {
    name: 'retro',
    label: 'Retro',
    cssFile: 'md-retro.css',
    wrapperClass: 'md-retro',
    removeProse: true,
    description: 'A blast from the past with monospace typewriter feel',
    googleFonts: [],
    cdnFonts: [],
  },

  // Air: Light and airy with Open Sans
  air: {
    name: 'air',
    label: 'Air',
    cssFile: 'md-air.css',
    wrapperClass: 'md-air',
    removeProse: true,
    description: 'Light and airy styling with generous whitespace',
    googleFonts: ['Open+Sans:ital,wght@0,400;0,700;1,400;1,700'],
    cdnFonts: [],
  },
}

/**
 * Parse AVAILABLE_STYLES from environment variable
 * Format: AVAILABLE_STYLES="github","mcss-georgia","pico","tufte"
 * If not set, returns all styles
 *
 * @returns {string[]} Array of style names to make available
 */
export function parseAvailableStyles() {
  const envValue = process.env.AVAILABLE_STYLES

  // If not set, return all style names
  if (!envValue || envValue.trim() === '') {
    return Object.keys(FULL_STYLE_REGISTRY)
  }

  // Parse the comma-separated, quoted values
  // Handles formats like: "github","pico","tufte" or github,pico,tufte
  const styles = envValue
    .split(',')
    .map((s) =>
      s
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim(),
    )
    .filter((s) => s.length > 0)

  // Validate that all specified styles exist
  const validStyles = styles.filter((name) => {
    if (FULL_STYLE_REGISTRY[name]) {
      return true
    }
    console.warn(`[StyleRegistry] Unknown style "${name}" in AVAILABLE_STYLES - skipping`)
    return false
  })

  // Always include at least 'tailwind' as fallback
  if (validStyles.length === 0) {
    console.warn('[StyleRegistry] No valid styles in AVAILABLE_STYLES - using tailwind')
    return ['tailwind']
  }

  return validStyles
}

/**
 * Build the filtered STYLE_REGISTRY based on AVAILABLE_STYLES env var
 * This is the registry that will be exposed to the client
 *
 * @returns {Object} Filtered style registry
 */
export function buildStyleRegistry() {
  const availableStyles = parseAvailableStyles()
  const registry = {}

  for (const name of availableStyles) {
    if (FULL_STYLE_REGISTRY[name]) {
      registry[name] = FULL_STYLE_REGISTRY[name]
    }
  }

  return registry
}

/**
 * Get style configuration by name
 * Falls back to 'tailwind' if style not found or not available
 *
 * @param {string} styleName - Name of the style
 * @param {Object} registry - The filtered style registry
 * @returns {Object} Style configuration object
 */
export function getStyleConfig(styleName, registry) {
  const normalizedName = (styleName || 'tailwind').toLowerCase().trim()

  // Check if style exists in the filtered registry
  if (registry[normalizedName]) {
    return registry[normalizedName]
  }

  // Fall back to tailwind if available, otherwise first available style
  if (registry['tailwind']) {
    return registry['tailwind']
  }

  // Last resort: return first available style
  const firstStyle = Object.keys(registry)[0]
  return registry[firstStyle] || FULL_STYLE_REGISTRY['tailwind']
}

/**
 * Get all available style names from the filtered registry
 *
 * @param {Object} registry - The filtered style registry
 * @returns {string[]} Array of style names
 */
export function getAvailableStyles(registry) {
  return Object.keys(registry)
}

/**
 * Get style choices for UI display (admin dropdown, etc.)
 * Returns array of {value, label, description} objects
 *
 * @param {Object} registry - The filtered style registry
 * @returns {Array} Array of style choice objects
 */
export function getStyleChoices(registry) {
  return Object.values(registry).map((style) => ({
    value: style.name,
    label: style.label,
    description: style.description,
  }))
}

/**
 * Generate Google Fonts link URL for a style
 * Returns null if no Google Fonts are required
 *
 * @param {Object} styleConfig - Style configuration object
 * @returns {string|null} Google Fonts URL or null
 */
export function getGoogleFontsUrl(styleConfig) {
  if (!styleConfig.googleFonts || styleConfig.googleFonts.length === 0) {
    return null
  }

  const families = styleConfig.googleFonts.join('&family=')
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`
}

/**
 * Get all required font links (Google Fonts + CDN fonts) for a style
 *
 * @param {Object} styleConfig - Style configuration object
 * @returns {string[]} Array of CSS link URLs to include
 */
export function getFontLinks(styleConfig) {
  const links = []

  // Add Google Fonts URL if needed
  const googleFontsUrl = getGoogleFontsUrl(styleConfig)
  if (googleFontsUrl) {
    links.push(googleFontsUrl)
  }

  // Add CDN font URLs
  if (styleConfig.cdnFonts && styleConfig.cdnFonts.length > 0) {
    links.push(...styleConfig.cdnFonts)
  }

  return links
}

// =============================================================================
// DEFAULT EXPORT - Pre-built registry for common use
// =============================================================================
export default {
  FULL_STYLE_REGISTRY,
  parseAvailableStyles,
  buildStyleRegistry,
  getStyleConfig,
  getAvailableStyles,
  getStyleChoices,
  getGoogleFontsUrl,
  getFontLinks,
}
