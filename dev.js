// Runs server and Tailwind CSS watcher in parallel

import { $ } from "bun";

console.log("🚀 Starting development environment...\n");

// Start Tailwind CSS watcher in background
console.log("🎨 Starting Tailwind CSS watcher...");
const tailwindProcess = Bun.spawn(
  [
    "bunx",
    "@tailwindcss/cli@",
    "-i",
    "./public/styles/input.css",
    "-o",
    "./public/styles/output.css",
    "--watch",
  ],
  {
    stdout: "ignore", // equivalent to .quiet()
    stderr: "ignore",
  },
);
// $`bunx @tailwindcss/cli -i ./public/styles/input.css -o ./public/styles/output.css --watch`.quiet();

// Give Tailwind a moment to initialize
await new Promise((resolve) => setTimeout(resolve, 2000));

// Start Bun server with watch mode
console.log("🔨 Starting Bun with hot reload...");
const serverProcess = Bun.spawn(["bun", "--watch", "./public/index.html"], {
  stdout: "ignore", // equivalent to .quiet()
  stderr: "ignore",
});

// const serverProcess = $`bun --watch public/test-tailwind.html`.quiet();

console.log("\nDevelopment environment ready!");
console.log("Tailwind: Watching for CSS changes");
console.log("\n✅  Use http://localhost:3000/ to run in browser");

console.log("\n   Press Ctrl+C to stop both processes\n");

// Handle graceful shutdown
function cleanup() {
  console.log("\n\n🛑 Shutting down...\n");
  tailwindProcess.kill();
  serverProcess.kill();
  process.exit(0);
}

// Listen for shutdown signals
process.on("SIGINT", cleanup); // Ctrl+C
process.on("SIGTERM", cleanup); // Kill command

// Keep the script running
try {
  await Promise.all([tailwindProcess, serverProcess]);
} catch (error) {
  console.error("Process error:", error);
  cleanup();
}
