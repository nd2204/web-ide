// Downloads the self-hosted Material Symbols Outlined font: a static instance
// (FILL 0, wght 400, GRAD 0, opsz 24) holding only the glyphs in
// src/icons.ts. Run `npm run icons -w web` after changing that list, and
// commit the new public/material_symbols_outlined.woff2.
import { writeFileSync } from "node:fs";
import { ICON_NAMES } from "../src/icons.ts";

const OUT = new URL("../public/material_symbols_outlined.woff2", import.meta.url);
const CSS =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:" +
  `opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${ICON_NAMES.join(",")}`;
// Google Fonts picks the font format from the user agent; this one gets woff2.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

async function get(url) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response;
}

const css = await (await get(CSS)).text();
const font = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)?.[1];
if (!font) throw new Error(`no woff2 in the Google Fonts CSS:\n${css}`);
const bytes = Buffer.from(await (await get(font)).arrayBuffer());
writeFileSync(OUT, bytes);
console.log(`${OUT.pathname}: ${ICON_NAMES.length} icons, ${bytes.length} B`);
