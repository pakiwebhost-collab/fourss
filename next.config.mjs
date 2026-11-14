const cpanelBuild = process.env.CPANEL_BUILD === "1";
const releaseCommit = process.env.FOURSS_RELEASE_COMMIT;

if (releaseCommit && !/^[a-f0-9]{40}$/.test(releaseCommit)) {
  throw new Error("FOURSS_RELEASE_COMMIT must be a full Git SHA.");
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  ...(releaseCommit && {
    generateBuildId: async () => releaseCommit,
    headers: async () => [{
      source: "/",
      headers: [
        { key: "X-4SS-Release", value: releaseCommit },
        { key: "Cache-Control", value: "private, no-store" },
      ],
    }],
  }),
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
    ...(cpanelBuild && {
      cpus: 1,
      // Keep each sequential compiler in a fresh process despite the custom hook.
      webpackBuildWorker: true,
      webpackMemoryOptimizations: true,
    }),
  },
  ...(cpanelBuild && {
    webpack(config) {
      config.parallelism = 4;
      return config;
    },
  }),
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
