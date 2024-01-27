import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  useNavigation,
  useResolvedPath,
  useRouteError,
  Link,
  isRouteErrorResponse,
  useLoaderData,
} from '@remix-run/react';

import styles from './tailwind.css';

import {
  DiscoverIcon,
  LoginIcon,
  LogoutIcon,
  RecipeBookIcon,
  SettingsIcon,
} from './components/icons';
import classNames from 'classnames';
import { getCurrentUser } from './utils/auth.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix Recipes' },
    { name: 'description', content: 'Welcome to the Remix Recipes App!' },
  ];
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '/theme.css' },
  { rel: 'stylesheet', href: styles },
];

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);

  return json({ isLoggedIn: user !== null });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="md:flex md:h-screen bg-background">
        <nav
          className={classNames(
            'fixed bottom-0 w-[100%] md:static md:w-auto bg-primary text-white ',
            'flex md:flex-col justify-between',
          )}
        >
          <ul className="flex justify-around md:flex-col">
            <AppNavLink to="discover">
              <DiscoverIcon />
            </AppNavLink>
            {data.isLoggedIn ? (
              <AppNavLink to="app/recipes">
                <RecipeBookIcon />
              </AppNavLink>
            ) : null}
            <AppNavLink to="settings">
              <SettingsIcon />
            </AppNavLink>
          </ul>
          <ul>
            {data.isLoggedIn ? (
              <AppNavLink to="/logout">
                <LogoutIcon />
              </AppNavLink>
            ) : (
              <AppNavLink to="/login">
                <LoginIcon />
              </AppNavLink>
            )}
          </ul>
        </nav>
        <div className="p-4 w-full md:w-[calc(100%-4rem)]">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

type AppNavLinkProps = {
  to: string;
  children: React.ReactNode;
};

function AppNavLink({ to, children }: AppNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === null;

  return (
    <li className="w-16">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={classNames(
              'py-4 flex justify-center hover:bg-primary-light',
              isActive ? 'bg-primary-light' : '',
              isLoading ? 'animate-pulse bg-primary-light' : '',
            )}
          >
            {children}
          </div>
        )}
      </NavLink>
    </li>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Whooops!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-4">
          {isRouteErrorResponse(error) ? (
            <>
              <h1 className="text-2xl pb-3">
                {error.status} - {error.statusText}
                <p>You're seeing this page because an error occurred.</p>
                <p className="my-4 font-bold">{error.data.message}</p>
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-2xl pb-3">Whoops!</h1>
              <p>
                You're seeing this page because an unexpected error occurred.
              </p>
              {error instanceof Error ? (
                <p className="my-4 font-bold">{error.message}</p>
              ) : null}
            </>
          )}
          <Link to="/" className="text-primary">
            Take me home
          </Link>
        </div>
      </body>
    </html>
  );
}
