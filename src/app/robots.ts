import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/dashboard", "/api"],
    },
    sitemap: "https://www.michaelwongdrivingschool.com/sitemap.xml",
  };
}
