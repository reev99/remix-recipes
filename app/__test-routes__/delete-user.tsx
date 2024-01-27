import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { deleteUser } from '~/models/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    throw new Error('Email is required to delete the user');
  }

  await deleteUser(email);
  return redirect('/');
}
