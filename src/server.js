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

    if (path === "/") {
      return serveHtmlPage("./public/index.html");
    }

    // HTML pages - serve from public directory
    return serveHtmlPage("./public/views" + path);
  },
});

// Serve static files
function serveStatic(path) {
  const file = Bun.file(`./public${path}`);
  return new Response(file);
}

// Serve HTML pages
async function serveHtmlPage(path) {
  const pageFile = Bun.file(path);
  if (!(await pageFile.exists())) {
    return serve404();

    // Handle the missing file logic here
  } else {
    return new Response(pageFile, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
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
  } else {
    // Fallback
    return new Response("Not Found", { status: 404 });
  }
}
console.log(`Server running at http://localhost:${server.port}`);
