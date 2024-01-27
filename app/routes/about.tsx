import { Outlet, Link } from '@remix-run/react';

export default function About() {
  return (
    <div>
      <h2>About</h2>
      <p>This is the about page.</p>
      <Link to="history">Our History</Link>
      <Link to="team">Our Team</Link>
      <Outlet />
    </div>
  );
}
