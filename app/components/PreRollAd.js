"use client";

import { useEffect, useRef, useState } from "react";
import { shouldShowAd } from "../config/ads";

const SKIP_AFTER = Number(process.env.NEXT_PUBLIC_PREROLL_SKIP_SECONDS) || 5;
const COOLDOWN_MS = 5 * 60 * 1000; // at most one pre-roll per 5 minutes per tab
const STORAGE_KEY = "maal_preroll_ts";

const ping = (url) => {
  try { new Image().src = url; } catch {}
};

async function loadVast(url, signal, depth = 0) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`VAST HTTP ${res.status}`);
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");

  const mediaFiles = Array.from(xml.getElementsByTagName("MediaFile"));
  const media =
    mediaFiles.find((n) => (n.getAttribute("type") || "").includes("mp4")) ||
    mediaFiles.find((n) => (n.getAttribute("type") || "").includes("video")) ||
    mediaFiles[0];
  const mediaUrl = media?.textContent?.trim();

  if (!mediaUrl) {
    // Wrapper VAST: follow one or two redirects
    const next = xml.getElementsByTagName("VASTAdTagURI")[0]?.textContent?.trim();
    if (next && depth < 2) return loadVast(next, signal, depth + 1);
    throw new Error("No media file in VAST");
  }

  const text = (tag) =>
    Array.from(xml.getElementsByTagName(tag)).map((n) => n.textContent.trim()).filter(Boolean);

  return {
    mediaUrl,
    click: text("ClickThrough")[0] || "",
    impressions: text("Impression"),
  };
}

// Video pre-roll shown on top of the player. Never blocks the video: any failure,
// slow response, or cooldown hit calls onDone() immediately.
export default function PreRollAd({ vastUrl, onDone }) {
  const [ad, setAd] = useState(null);
  const [remaining, setRemaining] = useState(SKIP_AFTER);
  const doneRef = useRef(false);
  const startedRef = useRef(false);

  const finish = (played) => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (played) {
      try { sessionStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    }
    onDone();
  };

  useEffect(() => {
    if (!shouldShowAd("WATCH_PREROLL") || !vastUrl) return finish(false);
    try {
      const last = Number(sessionStorage.getItem(STORAGE_KEY)) || 0;
      if (Date.now() - last < COOLDOWN_MS) return finish(false);
    } catch {}

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    loadVast(vastUrl, ctrl.signal)
      .then(setAd)
      .catch(() => finish(false))
      .finally(() => clearTimeout(timer));

    return () => { clearTimeout(timer); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vastUrl]);

  useEffect(() => {
    if (!ad) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [ad]);

  if (!ad) return null;

  const onPlay = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    ad.impressions.forEach(ping);
  };

  return (
    <div className="preroll">
      <video
        src={ad.mediaUrl}
        autoPlay
        muted
        playsInline
        onPlay={onPlay}
        onEnded={() => finish(true)}
        onError={() => finish(false)}
        onClick={() => ad.click && window.open(ad.click, "_blank", "noopener,noreferrer")}
        style={{ cursor: ad.click ? "pointer" : "default" }}
      />
      <span className="preroll-label">Ad</span>
      <button
        type="button"
        className="preroll-skip"
        disabled={remaining > 0}
        onClick={() => finish(true)}
      >
        {remaining > 0 ? `Skip in ${remaining}s` : "Skip ad"}
      </button>
    </div>
  );
}
