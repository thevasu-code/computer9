export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const normalized = (fromEnv || "https://computer9.in").trim().replace(/\/$/, "");
  return normalized;
}

export const SITE_NAME = "Computer9";
export const DEFAULT_TITLE = "Computer9 - Computers, Components and Accessories";
export const DEFAULT_DESCRIPTION =
  "Shop laptops, desktops, computer components, networking gear, and accessories at Computer9 with secure checkout and fast shipping.";
