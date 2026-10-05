"use client";

import { useEffect, useState } from "react";
import AdProviderBanner from "./AdProviderBanner";
import { AD_SLOTS, shouldShowAd } from "../config/ads";

// <AdBanner slot="HOME_TOP" mobileSlot="HOME_MOBILE" />
// Renders nothing in dev, when a placement is off, or before hydration.
export default function AdBanner({ slot, mobileSlot, className = "" }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const key = isMobile && mobileSlot ? mobileSlot : slot;
    setActive(shouldShowAd(key) && AD_SLOTS[key]?.zoneId ? key : null);
  }, [slot, mobileSlot]);

  if (!active) return null;
  const { zoneId, className: adClassName } = AD_SLOTS[active];

  return (
    <div className={`ad-slot ${className}`}>
      <span className="ad-label">Advertisement</span>
      <AdProviderBanner key={active} zoneId={zoneId} adClassName={adClassName} />
    </div>
  );
}
