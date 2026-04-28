import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/habit-tracker",
  images: { unoptimized: true },
};

export default nextConfig;
