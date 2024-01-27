import { redirect } from '@remix-run/node';
import { getUserById } from '~/models/user.server';
import { getSession } from '~/sessions';

/**
 * Gets the currently logged in user from the request session.
 *
 * Checks for a valid session cookie header, gets the user ID from it,
 * and returns the corresponding user object from the database.
 *
 * Returns null if there is no logged in user.
 */
export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const session = await getSession(cookieHeader);

  const userId = session.get('userId');

  if (typeof userId !== 'string') {
    return null;
  }

  return getUserById(userId);
}

/**
 * Checks if there is a logged in user in the request session.
 * If a user is logged in, redirects to /app.
 * Used to require that the user is not logged in for a route.
 */
export async function requireLoggedOutUser(request: Request) {
  const user = await getCurrentUser(request);

  if (user !== null) {
    throw redirect('/app');
  }
}

/**
 * Checks if there is a logged in user in the request session.
 * If no user is logged in, redirects to /login.
 * Used to require that there is a logged in user for a route.
 */
export async function requireLoggedInUser(request: Request) {
  const user = await getCurrentUser(request);

  if (user === null) {
    throw redirect('/login');
  }

  return user;
}
