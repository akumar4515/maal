import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Page not found</h1>
      <p style={{ marginBottom: 24 }}>The video or page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          borderRadius: 999,
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
