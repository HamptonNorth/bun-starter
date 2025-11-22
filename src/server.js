// version 2.0 Gemini 2.5 Pro
// server.js

import { Database } from "bun:sqlite";
import { join } from "path";
import { initialiseTestCountries, initialiseTestUsers } from "./db-setup.js";
import { handleApiRoutes } from "./routes/api.js";

// 1. Database Setup
// ---------------------------------------------------------
// Create and export database instance
export const db = new Database(join(import.meta.dir, "../data", "app.db"));
console.log("SQLite database initialised - path: ./data/app.db");

// Initialize test tables
initialiseTestCountries(db, "test_countries");
initialiseTestUsers(db, "test_users");

// 2. Server Configuration
// ---------------------------------------------------------
const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`Request: ${req.method} ${path}`);

    // A. API Routes
    // -----------------------------------------------------
    if (path.startsWith("/api/")) {
      return handleApiRoutes(req, path);
    }

    // B. Static Assets (CSS, JS, Images, Components)
    // -----------------------------------------------------
    // We explicitly check for folders we want to serve publicly
    if (
      path.startsWith("/styles/") ||
      path.startsWith("/scripts/") ||
      path.startsWith("/assets/") ||
      path.startsWith("/components/") || // Added components folder
      path.startsWith("/docs/")
    ) {
      return serveStatic(path);
    }

    // Special case for favicon
    if (path === "/favicon.ico") {
      return new Response(Bun.file("./favicon.ico"));
    }

    // C. HTML Pages (Routing)
    // -----------------------------------------------------
    if (path === "/") {
      return serveHtmlPage("./public/index.html");
    }

    // Default: Try to find a matching HTML file in /public/views
    // This handles /countries.html, /about.html, etc.
    return serveHtmlPage("./public/views" + path);
  },
});

// 3. Helper Functions
// ---------------------------------------------------------

/**
 * Serves a static file from the public directory.
 * @param {string} path - The URL path requested
 */
function serveStatic(path) {
  const file = Bun.file(`./public${path}`);
  return new Response(file, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/**
 * Serves an HTML file, returning 404 if missing.
 * @param {string} filepath - The local file system path
 */
async function serveHtmlPage(filepath) {
  const pageFile = Bun.file(filepath);

  if (!(await pageFile.exists())) {
    return serve404();
  }

  return new Response(pageFile, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Serves the custom 404 page.
 */
async function serve404() {
  const notFoundFile = Bun.file("./public/views/404.html");
  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return new Response("Not Found", { status: 404 });
}

console.log(`Server running at http://localhost:${server.port}`);
