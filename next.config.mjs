/** @type {import('next').NextConfig} */
const nextConfig = {
  // Replit serves the dev server through a proxied iframe on a different origin.
  // Next.js dev does not perform host-header verification, so the proxy works
  // without extra host allow-listing.
};

export default nextConfig;
