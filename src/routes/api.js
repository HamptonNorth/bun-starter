import {
  getAllTestCountries,
  searchTestCountries,
} from "../controllers/testCountries.controller.js";
import {
  getAllTestUsers,
  addTestUser,
  updateTestUser,
  deleteTestUser,
} from "../controllers/testUsers.controller.js";

// Handle API routes
export async function handleApiRoutes(req, path) {
  // Wrap all routing in a single try...catch block
  // This catches any errors thrown from the controllers and bubbles them
  // up from the model layer, removing the need for try/catch in every controller.
  try {
    const method = req.method;
    const url = new URL(req.url);

    // route: get all countries
    if (path === "/api/test-countries" && method === "GET") {
      return getAllTestCountries(); // calls function in controller
    }

    // route: Search contries table
    if (path === "/api/search-test-countries" && method === "GET") {
      const searchTerm = url.searchParams.get("search") || "";

      return searchTestCountries(searchTerm); // calls function in controller
    }

    // route: get all users
    if (path === "/api/test-users" && method === "GET") {
      return getAllTestUsers(); // calls function in controller
    }

    // route: Add new user
    if (path === "/api/add-test-user" && method === "POST") {
      const jsonData = await req.json();
      return addTestUser(jsonData);
    }

    // route: Amend user
    if (path === "/api/update-test-user" && method === "PUT") {
      const jsonData = await req.json();
      return updateTestUser(jsonData);
    }

    // route: Delete user
    if (path === "/api/delete-test-user" && method === "DELETE") {
      const jsonData = await req.json();
      return deleteTestUser(jsonData);
    }

    // If no API route is matched, serve the custom 404 HTML page
    const file404 = Bun.file("./public/404.html");
    return new Response(file404, {
      status: 404,
      // Set the content type header so the browser renders it as HTML
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    // This single block now handles all errors from all controller functions
    console.error("API Route Error: ", e.message);
    // Return a generic server error response
    return Response.json(
      { error: "Server error", details: e.message },
      { status: 500 }
    );
  }
}
