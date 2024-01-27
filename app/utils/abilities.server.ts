import db from '~/db.server';
import { requireLoggedInUser } from './auth.server';
import { json } from '@remix-run/node';

export async function canChangeRecipe(request: Request, recipeId: string) {
  const user = await requireLoggedInUser(request);
  const recipe = await db.recipe.findUnique({
    where: {
      id: recipeId,
    },
  });

  if (recipe === null) {
    throw json(
      {
        message: 'A recipe with that ID does not exist',
      },
      {
        status: 404,
      },
    );
  }

  if (recipe.userId !== user.id) {
    throw json(
      {
        message: 'You do not hhave permission to edit this recipe',
      },
      {
        status: 401,
      },
    );
  }
}
