import { NextResponse } from "next/server";
import { fetchVideos, PAGE_SIZE } from "../../lib/eporner";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("per_page") || String(PAGE_SIZE), 10) || PAGE_SIZE)
  );

  const order = q === "newest" || q === "new" ? "latest" : "most-popular";
  const searchQ = q === "newest" || q === "new" ? "" : q;

  const result = await fetchVideos({
    query: searchQ,
    page,
    perPage,
    order,
  });

  // Never cache empty/failed results, otherwise one network error sticks for minutes
  const cacheable = result.videos.length > 0;

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": cacheable
        ? "public, s-maxage=120, stale-while-revalidate=300"
        : "no-store",
    },
  });
}
