"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term) {
      router.push(`/?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="header">
      <Link href="/" className="logo">
        maal<span>.</span>
      </Link>
      <form className="search-form" onSubmit={onSubmit} role="search">
        <input
          className="search-input"
          type="search"
          placeholder="Search videos..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search videos"
        />
        <button type="submit" className="search-btn" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </form>
    </header>
  );
}
