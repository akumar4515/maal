export const PAGE_SIZE = 24;

// Server-side only. Supports the old NEXT_PUBLIC_ name too so existing .env files keep working.
const BACKEND = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://halloween-backend-cria.onrender.com"
).replace(/\/+$/, "");

const EPORNER_API = "https://www.eporner.com/api/v2";

/* ------------------------------ formatters ------------------------------ */

export function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatCount(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

export function formatRelativeDate(added) {
  if (!added) return "";
  if (
    typeof added === "string" &&
    /ago|hour|day|week|month|year/i.test(added)
  ) {
    return added;
  }
  // "2024-05-01 12:30:00" -> ISO form so Safari can parse it
  const d = new Date(String(added).replace(" ", "T"));
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/* ------------------------------ normalizing ----------------------------- */

function safeEmbed(rawEmbed, id) {
  const fallback = `https://www.eporner.com/embed/${id}/`;
  if (!rawEmbed) return fallback;
  try {
    const { hostname } = new URL(String(rawEmbed));
    if (hostname === "eporner.com" || hostname.endsWith(".eporner.com")) {
      return String(rawEmbed).replace(/\/?$/, "/");
    }
  } catch {
    // invalid URL -> fallback
  }
  return fallback;
}

function normalizeVideo(v) {
  if (!v) return null;

  const id = v.id || v.video_id || v.raw?.id;
  if (!id) return null;

  const title = v.title || v.raw?.title || "Untitled";

  const thumb =
    v.thumbnail_url ||
    v.thumbnail ||
    v.thumb ||
    v.default_thumb?.src ||
    v.thumbs?.[0]?.src ||
    v.raw?.default_thumb?.src ||
    v.raw?.thumbs?.[0]?.src ||
    "";

  const duration =
    v.length_sec || v.duration || v.length || v.raw?.length_sec || 0;

  const views = v.views || v.view_count || v.raw?.views || 0;
  const added = v.added || v.created_at || v.uploaded || v.raw?.added || null;

  const embed = safeEmbed(v.embed_url || v.embed || v.video_url, id);

  const url =
    v.url || v.raw?.url || `https://www.eporner.com/video-${id}/`;

  return {
    id: String(id),
    title,
    thumbnail: thumb,
    duration: Number(duration) || 0,
    views: Number(views) || 0,
    added,
    embed,
    url,
    keywords: v.keywords || v.raw?.keywords || "",
  };
}

function extractVideos(payload) {
  if (!payload) return [];
  if (payload.success && payload.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data.videos)) return payload.data.videos;
    if (Array.isArray(payload.data.data)) return payload.data.data;
  }
  if (Array.isArray(payload.videos)) return payload.videos;
  if (Array.isArray(payload)) return payload;
  return [];
}

function extractPagination(payload, page, perPage, videoCount) {
  const data = payload?.data ?? payload ?? {};
  const total =
    data.total_count ?? data.count ?? payload?.total_count ?? videoCount;
  const explicitPages = data.total_pages ?? payload?.total_pages;

  let hasMore;
  if (explicitPages != null) {
    hasMore = page < Number(explicitPages) && videoCount > 0;
  } else {
    // No page info from the API: a full page probably means there's another one
    hasMore = videoCount >= perPage;
  }
  return { total: Number(total) || 0, hasMore };
}

/* -------------------------------- network ------------------------------- */

function describeError(err) {
  const cause = err?.cause?.code || err?.cause?.message || "";
  return `${err?.message || err}${cause ? ` (${cause})` : ""}`;
}

async function fetchJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }, // short server-side cache; use cache: "no-store" for always-live
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------- API ---------------------------------- */

/** Primary: your Render backend. Fallback: direct Eporner API. */
export async function fetchVideos({
  query = "",
  page = 1,
  perPage = PAGE_SIZE,
  order = "most-popular",
} = {}) {
  const q = (query || "").trim();
  const isNewest = q === "newest" || q === "new";
  const searchTerm = isNewest ? "" : q;
  const sort = isNewest ? "latest" : order || "most-popular";

  // --- 1) Backend ---
  try {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      thumbsize: "big",
      order: sort,
    });

    let backendUrl;
    if (searchTerm) {
      params.set("query", searchTerm);
      backendUrl = `${BACKEND}/api/eporner/videos/search?${params}`;
    } else {
      backendUrl = `${BACKEND}/api/eporner/videos?${params}`;
    }

    const data = await fetchJson(backendUrl);
    const list = extractVideos(data);
    const videos = list.map(normalizeVideo).filter(Boolean);
    const { total, hasMore } = extractPagination(data, page, perPage, videos.length);

    if (videos.length > 0) {
      return { videos, hasMore, total, page };
    }
  } catch (err) {
    console.warn("Backend fetch failed, trying direct API:", describeError(err));
  }

  // --- 2) Direct Eporner API ---
  try {
    const params = new URLSearchParams({
      query: searchTerm || "all",
      page: String(page),
      per_page: String(Math.min(100, perPage)),
      thumbsize: "big",
      order: sort === "latest" ? "latest" : "most-popular",
      format: "json",
      gay: "0",
      lq: "1",
    });
    const data = await fetchJson(`${EPORNER_API}/video/search/?${params}`);
    const list = extractVideos(data);
    const videos = list.map(normalizeVideo).filter(Boolean);
    const { total, hasMore } = extractPagination(data, page, perPage, videos.length);
    return { videos, hasMore, total, page };
  } catch (err) {
    console.error("fetchVideos error:", describeError(err));
    return { videos: [], hasMore: false, total: 0, page };
  }
}

export async function fetchVideoById(id) {
  const idStr = String(id);

  try {
    const data = await fetchJson(
      `${BACKEND}/api/eporner/video/${encodeURIComponent(idStr)}`
    );
    const raw = data?.data || data?.video || data;
    const video = normalizeVideo(raw);
    if (video) return video;
  } catch (err) {
    console.warn("Backend video fetch failed, trying direct API:", describeError(err));
  }

  try {
    const params = new URLSearchParams({
      id: idStr,
      format: "json",
      thumbsize: "big",
    });
    const data = await fetchJson(`${EPORNER_API}/video/id/?${params}`);
    const raw = data?.video || data;
    return normalizeVideo(raw);
  } catch (err) {
    console.error("fetchVideoById error:", describeError(err));
    return null;
  }
}

export const CATEGORIES = [
  "Amateur",
  "Anal",
  "Asian",
  "Big Tits",
  "Blonde",
  "Brunette",
  "Creampie",
  "Cumshot",
  "Ebony",
  "Hardcore",
  "Lesbian",
  "MILF",
  "POV",
  "Teen",
  "Threesome",
];
