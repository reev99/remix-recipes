import { json } from '@remix-run/node';
import type {
  ActionFunctionArgs,
  ActionFunction,
  LoaderFunction,
} from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import React from 'react';
import { z } from 'zod';
import { ErrorMessage, PrimaryButton, PrimaryInput } from '~/components/form';
// import { sessionCookie } from '~/cookies';
import { generateMagicLink, sendMagicLinkEmail } from '~/magic-links.server';
// import { getUser } from '~/models/user.server';
import { commitSession, getSession } from '~/sessions';
import { validateForm } from '~/utils/validation';
import { v4 as uuid } from 'uuid';
import { requireLoggedOutUser } from '~/utils/auth.server';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const loader: LoaderFunction = async ({ request }) => {
  await requireLoggedOutUser(request);

  return null;
};

/**
 * The action function handles the login form submission.
 * It validates the form data against the loginSchema.
 * If valid, it generates a magic link, saves a nonce in the session,
 * sends a magic link email, and returns a 200 OK response.
 * If invalid, it returns a 400 response with the validation errors.
 */
export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  await requireLoggedOutUser(request);

  const formData = await request.formData();
  const cookieHeader = request.headers.get('cookie');
  const session = await getSession(cookieHeader);

  return validateForm(
    formData,
    loginSchema,
    async ({ email }) => {
      const nonce = uuid();
      session.set('nonce', nonce);

      const link = generateMagicLink(email, nonce);
      await sendMagicLinkEmail(link, email);

      return json('ok', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    },
    (errors) => json({ errors, email: formData.get('email') }, { status: 400 }),
  );
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="text-center mt-36">
      {actionData === 'ok' ? (
        <div>
          <h1 className="text-2xl py-8">Yum!</h1>
          <p>
            Check your email and follow the instructions to finish logging in
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl mb-8">Remix Recipes</h1>
          <form action="" method="post" className="mx-auto md:w-1/3">
            <div className="text-left pb-4">
              <PrimaryInput
                type="email"
                name="email"
                defaultValue={actionData?.email}
                placeholder="Email"
                autoComplete="off"
              />
              <ErrorMessage>{actionData?.errors?.email}</ErrorMessage>
            </div>
            <PrimaryButton className="w-1/2 mx-auto">Log In</PrimaryButton>
          </form>
        </div>
      )}
    </div>
  );
}
