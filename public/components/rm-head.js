// version 1.2 Gemini 2.5 Pro
// public/components/rm-head.js

// Import Lit from a CDN
import { LitElement } from 'https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm'

export class RmHead extends LitElement {
  static properties = {
    pageTitle: { type: String, attribute: 'page-title' },
  }

  createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this.initHead()
  }

  /**
   * Populates the document head with common meta tags
   * Note: CSS and Scripts are handled in the HTML to prevent FOUC and Race Conditions.
   */
  initHead() {
    // 1. Set Page Title
    if (this.pageTitle) {
      document.title = this.pageTitle
    }

    // 2. Add Common Meta Tags
    this.addMetaTag('charset', 'UTF-8')
    this.addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    this.addMetaTag('description', 'Bun starter template')
    this.addMetaTag('author', 'RNC')
    this.addMetaTag('keywords', 'Bun 1.3 bun-serve tailwind tailwindcss Lit SQLite')

    // 3. Favicon (Low priority asset, okay to inject)
    this.addLinkTag('icon', '/favicon.ico', 'image/x-icon')
  }

  addMetaTag(attrName, attrValue) {
    if (attrName === 'charset') {
      if (!document.querySelector('meta[charset]')) {
        const meta = document.createElement('meta')
        meta.setAttribute('charset', attrValue)
        document.head.appendChild(meta)
      }
      return
    }

    if (!document.querySelector(`meta[name="${attrName}"]`)) {
      const meta = document.createElement('meta')
      meta.name = attrName
      meta.content = attrValue
      document.head.appendChild(meta)
    }
  }

  addLinkTag(rel, href, type = null) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      if (type) link.type = type
      document.head.appendChild(link)
    }
  }
}

customElements.define('rm-head', RmHead)
