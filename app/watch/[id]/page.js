import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerWithAd from "../../components/PlayerWithAd";
import AdBanner from "../../components/AdBanner";
import { fetchVideoById, fetchVideos, formatCount, formatDuration, formatRelativeDate } from "../../lib/eporner";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const video = await fetchVideoById(id);
  if (!video) return { title: "Video not found" };
  return {
    title: video.title,
    description: `Watch ${video.title} in HD on maal.`,
  };
}

export default async function WatchPage({ params }) {
  const { id } = await params;
  const video = await fetchVideoById(id);

  if (!video) notFound();

  // Related: search by first keyword or generic popular
  const kw = (video.keywords || "").split(",")[0]?.trim() || "hardcore";
  const related = await fetchVideos({ query: kw, page: 1, perPage: 12 });
  const relatedList = (related.videos || []).filter((v) => v.id !== video.id).slice(0, 10);

  return (
    <div className="watch-layout">
      <div className="watch-main">
        <PlayerWithAd embed={video.embed} title={video.title} />
        <div className="watch-info">
          <h1 className="watch-title">{video.title}</h1>
          <div className="watch-meta">
            <span>{formatCount(video.views)} views</span>
            {video.duration > 0 && <span>{formatDuration(video.duration)}</span>}
            {video.added && <span>{formatRelativeDate(video.added)}</span>}
          </div>
        </div>
        <AdBanner slot="WATCH_BELOW_PLAYER" />
      </div>

      <aside className="watch-side">
        <AdBanner slot="WATCH_SIDEBAR" />
        <h2 className="related-title">Related videos</h2>
        <div className="related-list">
          {relatedList.map((v) => (
            <Link key={v.id} href={`/watch/${v.id}`} className="related-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnail}
                alt={v.title}
                className="related-thumb"
                loading="lazy"
              />
              <div className="related-body">
                <div className="related-title-text">{v.title}</div>
                <div className="related-meta">
                  {formatCount(v.views)} views
                  {v.duration ? ` · ${formatDuration(v.duration)}` : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
