// version 1.0 Gemini 2.5 Pro
// public/components/rm-footer.js

import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm'

export class RmFooter extends LitElement {
  // Render into Light DOM to inherit Tailwind Global Styles
  createRenderRoot() {
    return this
  }

  render() {
    const year = new Date().getFullYear()

    return html`
      <footer>
        <div class="mt-24 ml-8 text-xs text-slate-500">
          &copy; ${year} Redmug Software. All rights reserved.
        </div>
      </footer>
    `
  }
}

customElements.define('rm-footer', RmFooter)
