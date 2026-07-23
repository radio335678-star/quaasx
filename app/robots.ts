import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/product", "/benchmark", "/developers", "/about", "/brand/"],
        disallow: [
          "/app",
          "/app/",
          "/api/",
          "/login",
          "/register",
          "/scratch/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/product", "/benchmark", "/developers", "/about"],
        disallow: ["/app", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/product", "/benchmark", "/developers", "/about"],
        disallow: ["/app", "/api/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/product", "/benchmark", "/developers", "/about"],
        disallow: ["/app", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
