import db from '~/db.server';
import { handleDelete } from './utils';

export function getUser(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export function createUser(email: string, firstName: string, lastName: string) {
  return db.user.create({
    data: {
      email,
      firstName,
      lastName,
    },
  });
}

/**
 * Finds a user by their ID.
 *
 * @param id - The ID of the user to find.
 * @returns The user with the given ID, or null if no user found.
 */
export function getUserById(id: string) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

export function deleteUser(email: string) {
  return handleDelete(async () => {
    const user = await getUser(email);
    if (!user) {
      return null;
    }

    // Delete all of the user's data including their profile
    await db.recipe.deleteMany({
      where: {
        userId: user.id,
      },
    });
    await db.pantryShelf.deleteMany({
      where: {
        userId: user.id,
      },
    });
    await db.user.delete({
      where: {
        id: user.id,
      },
    });
  });
}
