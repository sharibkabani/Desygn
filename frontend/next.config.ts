import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow any url for images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },

};

export default nextConfig;
