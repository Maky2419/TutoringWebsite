import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://kcubed.ca/", lastModified: new Date() },
    // add other important pages:
    // { url: "https://kcubed.ca/about", lastModified: new Date() },
    // { url: "https://kcubed.ca/book", lastModified: new Date() },
  ];
}