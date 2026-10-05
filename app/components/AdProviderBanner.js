"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://a.magsrv.com/ad-provider.js";

// Renders one <ins> zone and asks the ad provider script to fill it.
export default function AdProviderBanner({ zoneId, adClassName }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !zoneId || !adClassName) return;

    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.type = "application/javascript";
      script.src = SCRIPT_SRC;
      document.body.appendChild(script);
    }

    if (!ref.current.querySelector("ins")) {
      const ins = document.createElement("ins");
      ins.className = adClassName;
      ins.setAttribute("data-zoneid", zoneId);
      ref.current.appendChild(ins);
    }

    window.AdProvider = window.AdProvider || [];
    window.AdProvider.push({ serve: {} });
  }, [zoneId, adClassName]);

  return <div ref={ref} className="ad-inner" />;
}
