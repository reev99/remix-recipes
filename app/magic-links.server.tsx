import { json } from '@remix-run/node';
import Cryptr from 'cryptr';
import { sendEmail } from './utils/emails.server';
import { renderToStaticMarkup } from 'react-dom/server';

if (typeof process.env.MAGIC_LINK_SECRET !== 'string') {
  throw new Error('Missing env: MAGIC_LINK_SECRET');
}
const cryptr = new Cryptr(process.env.MAGIC_LINK_SECRET);

type MagicLinkPayload = {
  email: string;
  nonce: string;
  createdAt: string;
};

/**
 * Generates a magic link URL for email validation.
 *
 * Encrypts a payload containing the email, nonce and timestamp.
 * Attaches the encrypted payload to the magic link URL as a query parameter.
 *
 * Throws if the ORIGIN env var is not defined.
 *
 * @param {string} email - The email address for authentication
 * @param {string} nonce - A unique nonce for added security
 * @param {string} createdAt - ISO timestamp of when the magic link was created
 */
export function generateMagicLink(email: string, nonce: string) {
  // create payload and encrypt it
  const payload: MagicLinkPayload = {
    email,
    nonce,
    createdAt: new Date().toISOString(),
  };
  const encryptedPayload = cryptr.encrypt(JSON.stringify(payload));

  // check for origin environment variable
  if (typeof process.env.ORIGIN !== 'string') {
    throw new Error('Missing env: ORIGIN');
  }
  // create a new URL object - attach pathname and the encrypted payload as the 'magic' query parameter
  const url = new URL(process.env.ORIGIN);
  url.pathname = '/validate-magic-link';
  url.searchParams.set('magic', encryptedPayload);

  return url.toString();
}

/**
 * Checks if the given value matches the shape of a valid
 * magic link payload object.
 */
function isMagicLinkPayload(value: any): value is MagicLinkPayload {
  return (
    typeof value === 'object' &&
    typeof value.email === 'string' &&
    typeof value.nonce === 'string' &&
    typeof value.createdAt === 'string'
  );
}

/**
 * Returns a 400 JSON response with the given error message.
 *
 * This is a helper function used internally to handle invalid magic link requests.
 */
export function invalidMagicLink(message: string) {
  return json({ message }, { status: 400 });
}

/**
 * Gets the decrypted magic link payload from the request URL.
 *
 * Extracts the encrypted 'magic' query parameter value, decrypts it,
 * parses the JSON payload, and validates it is a proper magic link payload.
 *
 * Throws 400 errors if the magic link is invalid.
 *
 * @param request - The incoming request
 * @returns The decrypted and validated magic link payload
 */
export function getMagicLinkPayload(request: Request) {
  const url = new URL(request.url);
  const magic = url.searchParams.get('magic');
  // if the magic value does not exist, throw an error
  if (typeof magic !== 'string') {
    throw invalidMagicLink("'magic' search parameter does not exist");
  }
  // decrypt the magic value and parse from JSON
  const magicLinkPayload = JSON.parse(cryptr.decrypt(magic));
  // if the magic value from the search param is not actually a Magic Link, throw an error
  if (!isMagicLinkPayload(magicLinkPayload)) {
    throw invalidMagicLink('invalid magic link payload');
  }
  return magicLinkPayload;
}

export function sendMagicLinkEmail(link: string, email: string) {
  // if (process.env.NODE_ENV === 'production') {
  const html = renderToStaticMarkup(
    <div>
      <h1>Log in to Remix Recipes</h1>
      <p>
        Hey there! Click the link below to finish logging in to the Remix
        Recipes app.
      </p>
      <a href={link}>Log In</a>
    </div>,
  );

  return sendEmail(
    'tech@blacksearecruitment.co.uk',
    'George',
    email,
    '',
    'Log in to Remix Recipes',
    html,
  );
  // } else {
  //   console.log(link);
  // }
}
