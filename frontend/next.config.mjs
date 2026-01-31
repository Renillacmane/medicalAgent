/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Expose API_URL to client so the widget can call the backend
  env: {
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
