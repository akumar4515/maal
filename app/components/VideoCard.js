import Link from "next/link";
import { formatDuration, formatCount, formatRelativeDate } from "../lib/eporner";

export default function VideoCard({ video }) {
  const { id, title, thumbnail, duration, views, added } = video;

  return (
    <Link href={`/watch/${id}`} className="card">
      <div className="thumb-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="thumb"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231d1819' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237d6e6d' font-family='system-ui' font-size='14'%3ENo preview%3C/text%3E%3C/svg%3E";
          }}
        />
        {duration > 0 && <span className="duration">{formatDuration(duration)}</span>}
        <span className="hd-badge">HD</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-meta">
          {formatCount(views)} views
          {added ? ` · ${formatRelativeDate(added)}` : ""}
        </p>
      </div>
    </Link>
  );
}
