import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useFetchers,
  useLoaderData,
  useLocation,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { DeleteButton, PrimaryButton, SearchBar } from '~/components/form';
import { CalendarIcon, PlusIcon } from '~/components/icons';
import {
  RecipeCard,
  RecipeDetailWrapper,
  RecipeListWrapper,
  RecipePageWrapper,
} from '~/components/recipes';
import db from '~/db.server';
import { requireLoggedInUser } from '~/utils/auth.server';
import { classNames, useBuildSearchParams } from '~/utils/misc';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const filter = url.searchParams.get('filter');

  const recipes = await db.recipe.findMany({
    where: {
      userId: user.id,
      name: {
        contains: q ?? '',
        mode: 'insensitive',
      },
      // if the filter is on then only show recipes with mealPlanMultiplier that is not null
      mealPlanMultiplier: filter === 'mealPlanOnly' ? { not: null } : {},
    },
    select: {
      name: true,
      totalTime: true,
      mealPlanMultiplier: true,
      imageUrl: true,
      id: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ recipes });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();

  switch (formData.get('_action')) {
    case 'createRecipe': {
      // create recipe
      const recipe = await db.recipe.create({
        data: {
          userId: user.id,
          name: 'New Recipe',
          totalTime: '0 min',
          mealPlanMultiplier: null,
          imageUrl: 'https://via.placeholder.com/150?text=Remix+Recipes',
          instructions: '',
        },
      });
      const url = new URL(request.url);
      url.pathname = `/app/recipes/${recipe.id}`;

      // redirect once the recipe has been created
      return redirect(url.toString());
    }

    case 'clearMealPlan': {
      await db.recipe.updateMany({
        where: {
          userId: user.id,
          mealPlanMultiplier: { not: null },
        },
        data: {
          mealPlanMultiplier: null,
        },
      });
      return redirect('/app/recipes');
    }

    default: {
      return null;
    }
  }
}

export default function Recipes() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const buildSearchParams = useBuildSearchParams();
  const [searchParams] = useSearchParams();
  const mealPlanOnlyFilterOn = searchParams.get('filter') === 'mealPlanOnly';

  return (
    <RecipePageWrapper>
      <RecipeListWrapper>
        <div className="flex gap-4">
          <SearchBar placeholder="Search Recipes..." className="flex-grow" />
          <Link
            className={classNames(
              'flex flex-col justify-center border-2 border-primary rounded-md px-2',
              mealPlanOnlyFilterOn ? 'text-white bg-primary' : 'text-primary',
            )}
            to={buildSearchParams(
              'filter',
              mealPlanOnlyFilterOn ? '' : 'mealPlanOnly',
            )}
            reloadDocument
          >
            <CalendarIcon />
          </Link>
        </div>
        <Form method="post" className="mt-4" reloadDocument>
          {mealPlanOnlyFilterOn ? (
            <DeleteButton
              className="w-full"
              name="_action"
              value="clearMealPlan"
            >
              Clear Plan
            </DeleteButton>
          ) : (
            <PrimaryButton
              className="w-full"
              name="_action"
              value="createRecipe"
            >
              <div className="flex w-full justify-center">
                <PlusIcon />
                <span className="ml-2">Create New Recipe</span>
              </div>
            </PrimaryButton>
          )}
        </Form>
        <ul>
          {data?.recipes.map((recipe) => {
            const isLoading = navigation.location?.pathname.endsWith(recipe.id);

            const optimisticData = new Map();

            // optimistic UI
            // check fetchers for 'saveName' and 'saveTotalTime' actions to get their latest form data
            for (const fetcher of fetchers) {
              if (fetcher.formAction?.includes(recipe.id)) {
                if (fetcher.formData?.get('_action') === 'saveName') {
                  optimisticData.set('name', fetcher.formData?.get('name'));
                }
                if (fetcher.formData?.get('_action') === 'saveTotalTime') {
                  optimisticData.set(
                    'totalTime',
                    fetcher.formData?.get('totalTime'),
                  );
                }
              }
            }

            return (
              <li className="my-4" key={recipe.id}>
                <NavLink
                  to={{ pathname: recipe.id, search: location.search }}
                  prefetch="intent"
                >
                  {({ isActive }) => (
                    <RecipeCard
                      name={optimisticData.get('name') ?? recipe.name}
                      totalTime={
                        optimisticData.get('totalTime') ?? recipe.totalTime
                      }
                      mealPlanMultiplier={recipe.mealPlanMultiplier}
                      imageUrl={recipe.imageUrl}
                      isActive={isActive}
                      isLoading={isLoading}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </RecipeListWrapper>
      <RecipeDetailWrapper>
        <Outlet />
      </RecipeDetailWrapper>
    </RecipePageWrapper>
  );
}
