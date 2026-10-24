import { fetchVideos } from "./lib/eporner";

export const dynamic = "force-dynamic";

const DEFAULT_SITE_URL = "https://maal.example.com";
const VIDEO_LIMIT = 500;
const MAX_PAGES = 10;

/**
 * Fetch a bounded set of watchable videos for the sitemap.
 * Uses the same normalization/fallback logic as the site's video feed.
 */
async function fetchVideosForSitemap(limit = VIDEO_LIMIT) {
  const videos = [];
  const seen = new Set();
  const perPage = 50;
  const pageCount = Math.min(MAX_PAGES, Math.ceil(limit / perPage));

  try {
    for (let page = 1; page <= pageCount && videos.length < limit; page += 1) {
      const result = await fetchVideos({
        query: "",
        page,
        perPage,
        order: "most-popular",
      });

      const batch = Array.isArray(result?.videos) ? result.videos : [];
      if (!batch.length) break;

      for (const video of batch) {
        if (!video?.id || seen.has(String(video.id))) continue;
        seen.add(String(video.id));
        videos.push(video);
        if (videos.length >= limit) break;
      }

      if (!result?.hasMore || batch.length < perPage) break;
    }
  } catch (error) {
    console.error("Failed to fetch videos for sitemap:", error);
  }

  return videos;
}

export default async function sitemap() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, "");

  const now = new Date();
  const videos = await fetchVideosForSitemap();

  const staticPages = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const videoPages = videos.map((video) => ({
    url: `${siteUrl}/watch/${encodeURIComponent(String(video.id))}`,
    lastModified: video.added ? parseDate(video.added) || now : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...videoPages];
}

function parseDate(value) {
  if (!value) return null;

  // Eporner sometimes returns "YYYY-MM-DD HH:mm:ss" rather than ISO.
  const date = new Date(
    typeof value === "string" ? value.replace(" ", "T") : value
  );

  return Number.isNaN(date.getTime()) ? null : date;
}
