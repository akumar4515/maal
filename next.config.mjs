/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.eporner.com" },
      { protocol: "https", hostname: "static-ca-cdn.eporner.com" },
      { protocol: "https", hostname: "**.eporner.com", pathname: "/**" },
      { protocol: "https", hostname: "www.eporner.com" },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
