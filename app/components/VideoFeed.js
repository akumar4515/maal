"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import VideoCard from "./VideoCard";
import AdBanner from "./AdBanner";
import { CATEGORIES, PAGE_SIZE } from "../lib/eporner";

async function fetchPage(q, page, signal) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(PAGE_SIZE),
  });
  if (q) params.set("q", q);
  const res = await fetch(`/api/feed?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function FilterChips({ active }) {
  const activeLower = active.toLowerCase();
  return (
    <div className="chips" role="navigation" aria-label="Categories">
      <Link href="/" className={`chip ${!active ? "active" : ""}`}>
        All
      </Link>
      {CATEGORIES.map((label) => (
        <Link
          key={label}
          href={`/?q=${encodeURIComponent(label)}`}
          className={`chip ${activeLower === label.toLowerCase() ? "active" : ""}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function VideoFeed() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true); // first page
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const qRef = useRef(q);

  // Load page 1 whenever the query changes (search, chip click, nav) — no full page reload
  useEffect(() => {
    qRef.current = q;
    const ctrl = new AbortController();

    setVideos([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setLoading(true);
    window.scrollTo({ top: 0 });

    fetchPage(q, 1, ctrl.signal)
      .then((data) => {
        const list = data.videos || [];
        setVideos(list);
        setHasMore(Boolean(data.hasMore) && list.length > 0);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError("Could not load videos.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [q, reloadKey]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const currentQ = q;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await fetchPage(currentQ, nextPage);
      if (qRef.current !== currentQ) return; // user changed query meanwhile
      const incoming = data.videos || [];
      setVideos((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return [...prev, ...incoming.filter((v) => !seen.has(v.id))];
      });
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore) && incoming.length > 0);
    } catch {
      setError("Could not load more videos.");
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, q]);

  return (
    <>
      <FilterChips active={q} />
      <AdBanner slot="HOME_TOP" mobileSlot="HOME_MOBILE" />

      {loading && <div className="loading">Loading videos…</div>}

      {!loading && !videos.length && (
        <div className="empty">
          <p>
            {error
              ? error
              : q
              ? `No videos found for “${q}”.`
              : "No videos available right now."}
          </p>
          <button
            type="button"
            className="load-more-btn"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <>
          <div className="grid">
            {videos.map((v, i) => {
              const n = i + 1;
              const showAd = n >= 12 && (n - 12) % 24 === 0 && n < videos.length;
              return (
                <Fragment key={v.id}>
                  <VideoCard video={v} />
                  {showAd && (
                    <div className="grid-ad">
                      <AdBanner slot="GRID" />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          {hasMore && (
            <div className="load-more-wrap">
              <button
                type="button"
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Show more"}
              </button>
            </div>
          )}

          {!hasMore && (
            <p className="empty" style={{ paddingTop: 16 }}>
              You’ve reached the end.
            </p>
          )}
        </>
      )}
    </>
  );
}
