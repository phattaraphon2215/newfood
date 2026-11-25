/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.trycloudflare.com",
        "*.lhr.life",
        "*.vercel.app",
      ],
    },
  },
};

export default nextConfig;


