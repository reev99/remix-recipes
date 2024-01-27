import { Prisma } from '@prisma/client';
import db from '~/db.server';
import { handleDelete } from './utils';

export function getAllShelves(userId: string, query: string | null) {
  return db.pantryShelf.findMany({
    where: {
      userId,
      name: {
        contains: query ?? '',
        mode: 'insensitive',
      },
    },
    include: {
      items: {
        orderBy: {
          name: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createShelf(userId: string) {
  try {
    const createdShelf = await db.pantryShelf.create({
      data: {
        name: 'New Shelf',
        userId,
      },
    });
    return createdShelf;
  } catch (error) {
    // return error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.message;
    }
    throw error;
  }
}

export function deleteShelf(id: string) {
  return handleDelete(() =>
    db.pantryShelf.delete({
      where: {
        id,
      },
    }),
  );
}

export async function saveShelfName(shelfId: string, name: string) {
  try {
    const updatedShelf = await db.pantryShelf.update({
      where: {
        id: shelfId,
      },
      data: {
        name: name,
      },
    });
    return updatedShelf;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }
    throw error;
  }
}

export function getShelf(id: string) {
  return db.pantryShelf.findUnique({
    where: {
      id,
    },
  });
}
