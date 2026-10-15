/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Story card is drawn with the bundled Noto Sans (Vercel's servers have no fonts), and satori
  // shapes text with harfbuzzjs, which opens its .wasm from disk at run time. File tracing can't see
  // either, so ship them with the job that draws the card.
  experimental: {
    outputFileTracingIncludes: {
      "/api/cron/stories": ["./assets/fonts/**", "./node_modules/harfbuzzjs/*.wasm", "./node_modules/satori/*.wasm"],
    },
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
