"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const isHome = pathname === "/" && !q;
  const isSearch = pathname === "/" && !!q;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <Link href="/" className={`nav-item ${isHome ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        Home
      </Link>
      <Link href="/?q=newest" className={`nav-item ${q === "newest" ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
        </svg>
        New
      </Link>
      <Link href="/?q=Amateur" className={`nav-item ${isSearch && q !== "newest" ? "active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        Browse
      </Link>
    </nav>
  );
}
