import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/api"],
    },
    sitemap: "https://www.michaelwongdrivingschool.com/sitemap.xml",
  };
}
