// Ad configuration for maal (ExoClick-network zones, same provider as the reference repo).
// Every zone id / class can be overridden with env vars; see .env.example.
// IMPORTANT: ad zones are tied to the domain you registered in your ad dashboard.
// Add the maal domain there (or create new zones) and put the new ids in .env.local.

const env = (name, fallback) => process.env[name] || fallback;

// Slot -> zone. `className` is the class given in the <ins> snippet from your dashboard.
export const AD_SLOTS = {
  // Home: under the chips (desktop / mobile) and inside the video grid
  HOME_TOP: {
    zoneId: env("NEXT_PUBLIC_ADPROVIDER_TOP_BANNER_ZONE_ID", "6047912"),
    className: env("NEXT_PUBLIC_ADPROVIDER_TOP_BANNER_CLASS", "eas6a97888e2"),
  },
  HOME_MOBILE: {
    zoneId: env("NEXT_PUBLIC_ADPROVIDER_MOBILE_BANNER_ZONE_ID", "6047922"),
    className: env("NEXT_PUBLIC_ADPROVIDER_MOBILE_BANNER_CLASS", "eas6a97888e10"),
  },
  GRID: {
    zoneId: env("NEXT_PUBLIC_ADPROVIDER_CONTENT_BANNER_1_ZONE_ID", "6047186"),
    className: env("NEXT_PUBLIC_ADPROVIDER_CONTENT_BANNER_1_CLASS", "eas6a97888e2"),
  },
  // Watch page: under the player and above "Related videos"
  WATCH_BELOW_PLAYER: {
    zoneId: env("NEXT_PUBLIC_ADPROVIDER_CONTENT_BANNER_2_ZONE_ID", "6046962"),
    className: env("NEXT_PUBLIC_ADPROVIDER_CONTENT_BANNER_2_CLASS", "eas6a97888e2"),
  },
  WATCH_SIDEBAR: {
    zoneId: env("NEXT_PUBLIC_ADPROVIDER_SIDEBAR_BANNER_ZONE_ID", "6047918"),
    className: env("NEXT_PUBLIC_ADPROVIDER_SIDEBAR_BANNER_CLASS", "eas6a97888e2"),
  },
};

export const AD_VAST = {
  PREROLL: env(
    "NEXT_PUBLIC_ADPROVIDER_PREROLL_VAST_URL",
    "https://s.magsrv.com/v1/vast.php?idzone=6047908"
  ),
};

// Turn individual placements on/off here.
export const AD_PLACEMENTS = {
  HOME_TOP: true,
  HOME_MOBILE: true,
  GRID: true,
  WATCH_BELOW_PLAYER: true,
  WATCH_SIDEBAR: true,
  WATCH_PREROLL: true,
};

// No ads on `npm run dev` unless NEXT_PUBLIC_ENABLE_ADS_DEV=true
export const ADS_ENABLED =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_ENABLE_ADS_DEV === "true";

export const POPUNDER_ZONE_ID = env("NEXT_PUBLIC_ADPROVIDER_POPUNDER_ZONE_ID", "6047926");

// On when a popunder zone id is set; force off with NEXT_PUBLIC_ENABLE_POPUNDER=false
export const POPUNDER_ENABLED =
  ADS_ENABLED &&
  Boolean(POPUNDER_ZONE_ID) &&
  process.env.NEXT_PUBLIC_ENABLE_POPUNDER !== "false";

export function shouldShowAd(slot) {
  return ADS_ENABLED && AD_PLACEMENTS[slot] === true;
}