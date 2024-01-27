import db from '~/db.server';
import { handleDelete } from './utils';

/**
 * Creates a new pantry item in the database.
 * @param userId - The ID of the user this item belongs to
 * @param shelfId - The ID of the shelf this item belongs on
 * @param name - The name of the item
 * @returns A promise that resolves to the created pantry item
 */
export function createShelfItem(userId: string, shelfId: string, name: string) {
  return db.pantryItem.create({
    data: {
      userId,
      shelfId,
      name,
    },
  });
}

/**
 * Deletes a pantry item by its ID.
 * @param id - The ID of the pantry item to delete.
 * @returns A promise that deletes the pantry item.
 */
export function deleteShelfItem(id: string) {
  return handleDelete(() =>
    db.pantryItem.delete({
      where: {
        id,
      },
    }),
  );
}

/**
 * Gets a pantry item by its ID.
 * @param id - The ID of the pantry item to get.
 * @returns The pantry item with the given ID.
 */
export function getShelfItem(id: string) {
  return db.pantryItem.findUnique({ where: { id } });
}
