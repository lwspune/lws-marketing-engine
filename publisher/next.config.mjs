/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Story card is drawn with the bundled Noto Sans (Vercel's servers have no fonts); it is read
  // from disk at run time, so ship the files with the job that draws it.
  experimental: {
    outputFileTracingIncludes: { "/api/cron/stories": ["./assets/fonts/**"] },
    // satori loads its own .wasm files from its package folder; bundled, it can't find them.
    serverComponentsExternalPackages: ["satori"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
