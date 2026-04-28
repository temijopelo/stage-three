import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "https://temijopelo.github.io/stage-three/", // Change to your repo name
  images: { unoptimized: true },
};

export default nextConfig;
