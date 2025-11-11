// version 1.1 Gemini Pro
import { db } from "../server.js";
import { nowSQLiteFormat } from "../utils.js";

/**
 * Gets all users that are not soft-deleted.
 */
export function getAllTestUsersData() {
  const query = db.query(
    `SELECT id, user_name, first_name, surname, status_setting, date_added, date_last_amended 
    FROM test_users 
    WHERE status_setting != 'Deleted'
    ORDER BY id `
  );
  return query.all();
}

/**
 * Gets a single user by their ID.
 * Used to check for existence before update/delete.
 * We also check that it's not already deleted.
 */
export function getTestUserByIdData(id) {
  const query = db.query(
    `SELECT id FROM test_users 
     WHERE id = $id AND status_setting != 'Deleted'`
  );
  // .get() is the most efficient way to fetch a single row
  return query.get({ $id: id });
}

/**
 * Inserts a new user into the database.
 * Uses named parameters for better maintainability.
 */
export function addTestUserData(userData) {
  const query = db.query(
    `INSERT INTO test_users (user_name, first_name, surname, status_setting, date_added, date_last_amended)
     VALUES ($userName, $firstName, $surname, $statusSetting, $now, $now)
  `
  );

  return query.run({
    $userName: userData.userName,
    $firstName: userData.firstName,
    $surname: userData.surname,
    $statusSetting: userData.statusSetting,
    $now: nowSQLiteFormat(),
  });
}

/**
 * Updates an existing user in the database.
 */
export function updateTestUserData(userData) {
  const query = db.query(
    `UPDATE test_users 
    SET user_name = $userName, 
        first_name = $firstName, 
        surname = $surname, 
        status_setting = $statusSetting, 
        date_last_amended = $now
    WHERE id = $id
  `
  );
  return query.run({
    $userName: userData.userName,
    $firstName: userData.firstName,
    $surname: userData.surname,
    $statusSetting: userData.statusSetting,
    $now: nowSQLiteFormat(),
    $id: userData.id,
  });
}

/**
 * Hard deletes a user from the database.
 */
export function deleteTestUserData(userData) {
  const query = db.query(`DELETE FROM test_users WHERE id = $id`);
  return query.run({
    $id: userData.id,
  });
}
