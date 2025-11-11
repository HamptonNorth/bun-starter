// version 1.7 Gemini Pro
// server.js

//  Connect to database
import { Database } from "bun:sqlite";
import { join } from "path";
import { initialiseTestCountries } from "./db-setup.js";
import { initialiseTestUsers } from "./db-setup.js";

import { handleApiRoutes } from "./routes/api.js";

// create and export database instance
export const db = new Database(join(import.meta.dir, "../data", "app.db"));
console.log("SQLite database initialised - path: ./data/app.db");

// set up example/test table
initialiseTestCountries(db, "test_countries");

// set up example/test table
initialiseTestUsers(db, "test_users");

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // API routes
    if (path.startsWith("/api/")) {
      return handleApiRoutes(req, path);
    }

    // Static assets (CSS, JS, images, docs, etc.)
    if (
      path.startsWith("/styles/") ||
      path.startsWith("/scripts/") ||
      path.startsWith("/assets/") ||
      path.startsWith("/docs/")
    ) {
      return serveStatic(path);
    }

    // Favicon
    if (path === "/favicon.ico") {
      return new Response(Bun.file("./favicon.ico"));
    }

    // HTML pages - serve from public directory
    return serveHtmlPage(path);
  },
});

// Serve static files
function serveStatic(path) {
  const file = Bun.file(`./public${path}`);

  return new Response(file);
}

// --- HTML Page Serving (with Templating) ---

// Define our pages and their metadata
const pages = {
  "/": {
    fragment: "./public/index.fragment.html",
    title: "Home",
  },
  "/about": {
    fragment: "./public/about.fragment.html",
    title: "About",
  },
  "/countries": {
    fragment: "./public/countries.fragment.html",
    title: "Countries",
    scripts: ['<script src="/scripts/countries.js"></script>'],
  },
  "/users": {
    fragment: "./public/users.fragment.html",
    title: "Users",
    scripts: ['<script src="/scripts/users.js"></script>'],
  },
};

// Cache the layout file for performance
// We use .text() to read the file into a string once on startup
const layout = await Bun.file("./public/_layout.html").text();

// Serve HTML pages
async function serveHtmlPage(path) {
  // Normalize path (e.g., /about.html -> /about)
  let pagePath = path.endsWith(".html") ? path.slice(0, -5) : path;
  if (pagePath.endsWith("/") && pagePath.length > 1) {
    pagePath = pagePath.slice(0, -1);
  }

  // Find the page configuration from our 'pages' object
  const pageConfig = pages[pagePath];

  // If page is not defined in our 'pages' object, serve 404
  if (!pageConfig) {
    return serve404();
  }

  // Try to load the page fragment
  const fragmentFile = Bun.file(pageConfig.fragment);
  if (!(await fragmentFile.exists())) {
    console.error(`Missing fragment file: ${pageConfig.fragment}`);
    return serve404();
  }

  const content = await fragmentFile.text();

  // Build page-specific head extras (like scripts)
  const headExtras = (pageConfig.scripts || []).join("\n");

  // Assemble the final HTML by replacing our placeholders
  const finalHtml = layout
    .replace("{{PAGE_TITLE}}", pageConfig.title)
    .replace("", headExtras)
    // This line right here is the one that was causing the confusion.
    // It looks for the *exact string* ""
    .replace("{{PAGE_CONTENT}}", content);

  return new Response(finalHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Serves the custom 404 page.
 */
async function serve404() {
  const notFoundFile = Bun.file("./public/404.html");

  // We keep 404.html as a standalone file, as it doesn't need the template
  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Fallback
  return new Response("Not Found", { status: 404 });
}

console.log(`Server running at http://localhost:${server.port}`);
