"use client";

import { useState } from "react";
import PreRollAd from "./PreRollAd";
import { AD_VAST } from "../config/ads";

export default function PlayerWithAd({ embed, title }) {
  const [adDone, setAdDone] = useState(false);
  return (
    <div className="player-wrap">
      <iframe
        src={`${embed}?autoplay=false`}
        title={title}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="eager"
      />
      {!adDone && <PreRollAd vastUrl={AD_VAST.PREROLL} onDone={() => setAdDone(true)} />}
    </div>
  );
}
