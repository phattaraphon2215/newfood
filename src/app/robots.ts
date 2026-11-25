import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://82182259a4baa4.app.lhr.life";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tasks", "/login", "/register"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
