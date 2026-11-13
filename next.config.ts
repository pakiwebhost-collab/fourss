import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep WordPress-style URLs (e.g. /about-us/) so existing links and SEO rankings carry over.
  trailingSlash: true,
  serverExternalPackages: ["sanitize-html", "nodemailer"],
  images: {
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/uploads/**" }, { pathname: "/brand/**" }],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
    ...(process.env.CPANEL_BUILD === "1" && {
      cpus: 1,
      webpackMemoryOptimizations: true,
    }),
  },
  async redirects() {
    return [
      { source: "/services", destination: "/our-services/", permanent: true },
      { source: "/our-clients", destination: "/client/", permanent: true },
      { source: "/blog", destination: "/blogs/", permanent: true },
      { source: "/mobile-armed-escort-and-bodyguard-service", destination: "/our-services/mobile-armed-escort-and-bodyguard-service/", permanent: true },
      { source: "/wp-admin", destination: "/admin/", permanent: false },
    ];
  },
};

export default nextConfig;
