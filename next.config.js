/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Vercel deployment is automatic, but this ensures compatibility
  output: undefined, // Use default for Vercel
}

module.exports = nextConfig
