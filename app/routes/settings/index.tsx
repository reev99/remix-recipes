import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

export function loader({ request }: LoaderFunctionArgs) {
  return redirect('/settings/app');
}
