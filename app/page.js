import Link from "next/link";
import { Suspense } from "react";
import VideoFeed from "./components/VideoFeed";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  if (q) {
    return {
      title: `${q} Videos`,
      description: `Watch free HD ${q} videos on maal.`,
    };
  }
  return {};
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="loading">Loading videos…</div>}>
        <VideoFeed />
      </Suspense>
      <footer className="footer">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <span>·</span>
          <span>18+ Only</span>
        </div>
        <p>© {new Date().getFullYear()} maal. All rights reserved.</p>
      </footer>
    </>
  );
}
