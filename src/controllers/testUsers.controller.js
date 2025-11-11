import {
  getAllTestUsersData,
  getTestUserByIdData, // Import new function for checking existence
  addTestUserData,
  updateTestUserData,
  deleteTestUserData,
} from "../models/testUsers.model.js";

/**
 * Gets all non-deleted test users.
 * Errors are caught by the central error handler in api.js.
 */
export function getAllTestUsers() {
  // Business logic here (if any)
  const users = getAllTestUsersData();
  return Response.json(users);
}

/**
 * Adds a new test user.
 */
export function addTestUser(userData) {
  // Extract data from the request body
  const userName = userData.user_name;
  const firstName = userData.first_name;
  const surname = userData.surname;
  const statusSetting = userData.status_setting;

  if (!userName || !firstName || !surname || !statusSetting) {
    return Response.json(
      {
        error: "Missing input",
        details: "All fields are required",
      },
      { status: 400 } // 400 Bad Request
    );
  }

  // Pass data to model
  const result = addTestUserData({
    userName,
    firstName,
    surname,
    statusSetting,
  });

  // Return success response
  return Response.json(
    {
      success: true,
      message: "User added successfully",
      id: result.lastInsertRowid,
    },
    { status: 201 } // 201 Created
  );
}

/**
 * Updates an existing test user.
 */
export function updateTestUser(userData) {
  // Extract data from the request body
  const id = userData.user_id;
  const userName = userData.user_name;
  const firstName = userData.first_name;
  const surname = userData.surname;
  const statusSetting = userData.status_setting;

  // Check if ID was provided
  if (!id) {
    return Response.json(
      {
        error: "Row id missing",
        details: "No id in userData",
      },
      { status: 400 }
    );
  }

  // Check if the user ID exists before attempting to update
  const existingUser = getTestUserByIdData(id);
  if (!existingUser) {
    return Response.json(
      {
        error: "Not Found",
        details: "The id entered does not exist", // User's requested message
      },
      { status: 404 } // 404 Not Found
    );
  }

  // Check for other required fields
  if (!userName || !firstName || !surname || !statusSetting) {
    return Response.json(
      {
        error: "Missing field",
        details: "All fields are required in userData",
      },
      { status: 400 }
    );
  }

  // Pass data to model
  const result = updateTestUserData({
    id,
    userName,
    firstName,
    surname,
    statusSetting,
  });

  // Return success response
  return Response.json(
    {
      success: true,
      message: "User updated successfully",
      id: id,
      user_name: userName,
    },
    { status: 200 } // 200 OK
  );
}

/**
 * Deletes (soft) an existing test user.
 */
export function deleteTestUser(userData) {
  // Extract data from the request body
  const id = userData.user_id;

  // Check if ID was provided
  if (!id) {
    return Response.json(
      {
        error: "Row id missing",
        details: "No id in userData",
      },
      { status: 400 }
    );
  }

  // Check if the user ID exists before attempting to delete
  const existingUser = getTestUserByIdData(id);
  if (!existingUser) {
    return Response.json(
      {
        error: "Not Found",
        details: "The id entered does not exist", // User's requested message
      },
      { status: 404 } // 404 Not Found
    );
  }

  // Pass data to model
  const result = deleteTestUserData({
    id,
  });

  // Return success response
  return Response.json(
    {
      success: true,
      message: "User deleted successfully",
      id: id,
    },
    { status: 200 } // 200 OK
  );
}
