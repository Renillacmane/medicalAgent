/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Expose API_URL to client so the widget can call the backend.
  // Next.js loads .env and .env.local automatically; .env.local overrides .env.
  env: {
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
