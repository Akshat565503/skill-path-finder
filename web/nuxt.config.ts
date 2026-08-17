// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000",
    },
  },

  // Proxy API requests in development
  routeRules: {
    "/api/**": {
      proxy: { to: "http://localhost:4000/api/**" },
    },
  },

  app: {
    head: {
      title: "Skill Path Finder",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Find the shortest learning path between skills and discover which job roles you're closest to qualifying for.",
        },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
        },
      ],
    },
  },
});
