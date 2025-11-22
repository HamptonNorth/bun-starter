// version 1.0 Gemini 2.5 Pro
// public/components/rm-header.js

import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm'

export class RmHeader extends LitElement {
  // Render into Light DOM to inherit Tailwind Global Styles
  createRenderRoot() {
    return this
  }

  render() {
    const currentPath = window.location.pathname

    // Helper to generate class string.
    // Adds 'underline font-semibold' if the link is active.
    const getLinkClass = (path) => {
      const baseClass = 'hover:underline'
      // Simple exact match or root match
      const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path))
      return isActive ? `${baseClass} underline font-semibold text-blue-900` : baseClass
    }

    return html`
      <header class="bg-slate-100 py-2">
        <nav class="flex gap-8 pt-2 pb-2 pl-12 text-blue-700">
          <a href="/" class="${getLinkClass('/')}">Home page</a>
          <a href="/countries.html" class="${getLinkClass('/countries.html')}">Countries</a>
          <a href="/users.html" class="${getLinkClass('/users.html')}">Users</a>
          <a href="/about.html" class="${getLinkClass('/about.html')}">About page</a>
        </nav>
      </header>
    `
  }
}

customElements.define('rm-navheader', RmHeader)
