import "./globals.css";
import { Suspense } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import AgeGate from "./components/AgeGate";
import PopunderScript from "./components/PopunderScript";

export const metadata = {
  title: {
    default: "maal – Free HD Adult Videos",
    template: "%s | maal",
  },
  description:
    "Watch free HD adult videos on maal. Fast streaming, mobile-friendly, daily updates.",
  keywords: ["free porn", "HD adult videos", "adult streaming", "maal"],
  robots: { index: true, follow: true },
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
    "content-rating": "adult",
  },
};

export const viewport = {
  themeColor: "#fff6e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://www.eporner.com" />
        <link rel="dns-prefetch" href="https://static-ca-cdn.eporner.com" />
      </head>
      <body>
        <AgeGate />
        <div className="app-shell">
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="main-content">{children}</main>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </div>
        <PopunderScript />
      </body>
    </html>
  );
}
