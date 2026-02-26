/**
 * Safely parse and return the user object from localStorage.
 * Returns an empty object if parsing fails or no user is stored.
 */
export const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};
