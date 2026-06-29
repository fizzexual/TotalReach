import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's engine out of the bundler so it loads correctly at runtime.
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
