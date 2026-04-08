#!/usr/bin/env node
/**
 * Parse tree.txt film listing and enrich with TMDB search results.
 * Resolves paths relative to the project root (parent of bin/).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TREE_PATH = existsSync(join(ROOT, "tree.txt"))
  ? join(ROOT, "tree.txt")
  : join(ROOT, "db", "tree.txt");
const OUT_PATH = join(ROOT, "tree.parsed.json");
const ENV_PATH = join(ROOT, ".env");

const VIDEO_EXTS = new Set([
  ".mp4",
  ".mkv",
  ".ts",
  ".avi",
  ".mov",
  ".webm",
  ".m4v",
  ".wmv",
]);

const NOISE_RE = new RegExp(
  String.raw`\b(?:` +
    String.raw`1080p|720p|2160p|480p|BluRay|BRRip|WEBRip|WEB[- ]?Rip|BDRip|BRrip|` +
    String.raw`HEVC|H265|H264|x265|x264|AV1|AAC5?|AC3|DDP|DD5|` +
    String.raw`YIFY|YTS\.?(?:AG|AM|MX)?|RARBG|GalaxyRG|KONTRAST|PSA|Deceit|bitloks|` +
    String.raw`BONE|BOKUTOX|ETRG|KiNGDOM|JYK|dAV1nci|heTOrico|Multi\d|` +
    String.raw`EXTENDED|REMASTERED|THEATRICAL|EDITION|UNRATED|Open[.\s]+Matte|` +
    String.raw`10th|Anniversary|Anniversary\.Edition|IC|DC|` +
    String.raw`10bit|6CH|ExD|ECE|FS94|Joy|` +
    String.raw`1080|720|2160|1400MB|Opus|264` +
    String.raw`)\b`,
  "gi",
);

const YEAR_RE = /\b(19\d{2}|20[0-3]\d)\b/;
const STATS_LINE = /^\d+ directories?,\s*\d+ files?$/;

function loadEnv(path) {
  /** @type {Record<string, string>} */
  const out = {};
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k) out[k] = v;
  }
  return out;
}

/**
 * @param {string} line
 * @returns {{ depth: number; name: string } | null}
 */
function parseTreeLine(line) {
  line = line.replace(/\n$/, "").replace(/\u00a0/g, " ");
  if (!line || line.startsWith("/") || STATS_LINE.test(line)) return null;
  let rest = line;
  let depth = 0;
  while (rest.startsWith("│   ")) {
    depth += 1;
    rest = rest.slice(4);
  }
  if (rest.startsWith("├── ")) rest = rest.slice(4);
  else if (rest.startsWith("└── ")) rest = rest.slice(4);
  else return null;
  return { depth, name: rest };
}

/** @param {string} name */
function isVideo(name) {
  const ext = extname(name).toLowerCase();
  return VIDEO_EXTS.has(ext);
}

/** @param {string} name */
function isDirectoryName(name) {
  if (isVideo(name)) return false;
  if (name.toLowerCase().endsWith(".srt")) return false;
  return true;
}

/**
 * @param {string} treeText
 * @returns {Array<[string, string | null]>}
 */
function iterVideoEntries(treeText) {
  /** @type {string[]} */
  const stack = [];
  /** @type {Array<[string, string | null]>} */
  const out = [];
  for (const line of treeText.split(/\r?\n/)) {
    const parsed = parseTreeLine(line);
    if (!parsed) continue;
    const { depth, name } = parsed;

    if (isDirectoryName(name) && !name.endsWith(".srt")) {
      while (stack.length > depth) stack.pop();
      stack.push(name);
      continue;
    }

    if (!isVideo(name)) continue;

    while (stack.length > depth) stack.pop();
    if (stack.includes("Subs")) continue;

    const folder = stack.length ? stack.join("/") : null;
    out.push([name, folder]);
  }
  return out;
}

/** @param {string} filename */
function stemFromFilename(filename) {
  const base = filename.replace(/^.*[/\\]/, "");
  const dot = base.lastIndexOf(".");
  return dot === -1 ? base : base.slice(0, dot);
}

/**
 * @param {string} filename
 * @returns {[string, number | null]}
 */
function guessQuery(filename) {
  let stem = stemFromFilename(filename);
  stem = stem.replace(/\s*\([^)]*\)\s*/g, " ");
  stem = stem.replace(/\[[^\]]*\]/g, " ");
  stem = stem.replace(/\s*-\s*$/, "");
  stem = stem.replace(/\+HI\b/gi, "");
  stem = stem.replace(/_/g, " ");
  let spaced = stem.replace(/\./g, " ");
  let year = null;
  const yearM = spaced.match(YEAR_RE);
  if (yearM) year = parseInt(yearM[1], 10);
  if (year != null) {
    spaced = spaced.replace(new RegExp(`\\b${year}\\b`), " ");
  }
  for (let i = 0; i < 2; i++) {
    spaced = spaced.replace(/\b5\s+1\b/g, " ");
    spaced = spaced.replace(/\b7\s+1\b/g, " ");
    spaced = spaced.replace(/\b2\s+0\b/g, " ");
  }
  spaced = spaced.replace(/\b(?:DD5|DDP|AAC5)\s+1\b/gi, " ");
  spaced = spaced.replace(NOISE_RE, " ");
  spaced = spaced.replace(/\s*-\s*$/, "");
  spaced = spaced.replace(/\s+/g, " ").trim();
  const parts = spaced.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts.at(-1) === "1" && parts.at(-2)?.toLowerCase() !== "part") {
    parts.pop();
  }
  spaced = parts.join(" ");
  return [spaced, year];
}

/**
 * @param {string} apiKey
 * @param {string} query
 * @param {number | null} year
 */
async function tmdbSearchMovie(apiKey, query, year) {
  const q = query.trim();
  if (!q) return null;
  const params = new URLSearchParams({ api_key: apiKey, query: q, language: "en-US" });
  if (year != null) params.set("primary_release_year", String(year));
  const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
  let data;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }
  const results = data.results || [];
  if (!results.length) return null;
  const pool = results.slice(0, 10);
  pool.sort(
    (a, b) =>
      (b.vote_count || 0) - (a.vote_count || 0) || (b.popularity || 0) - (a.popularity || 0),
  );
  const r0 = pool[0];
  return {
    id: r0.id,
    title: r0.title || r0.original_title,
    release_date: r0.release_date,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const env = loadEnv(ENV_PATH);
  const apiKey =
    env.TMDB_API_KEY ||
    env.TMBD_API_KEY ||
    process.env.TMDB_API_KEY ||
    process.env.TMBD_API_KEY ||
    "";

  const treeText = readFileSync(TREE_PATH, "utf8");
  const entries = iterVideoEntries(treeText);

  /** @type {Array<{ originalFileName: string; folder: string | null; tmdb: { id: number; title: string } | null }>} */
  const rows = [];
  for (const [originalName, folder] of entries) {
    const [query, year] = guessQuery(originalName);
    let tmdb = null;
    if (apiKey && query) {
      tmdb = await tmdbSearchMovie(apiKey, query, year);
      if (tmdb == null && year != null) tmdb = await tmdbSearchMovie(apiKey, query, null);
      await sleep(260);
    }
    rows.push({
      originalFileName: originalName,
      folder,
      tmdb:
        tmdb != null && tmdb.id != null ? { id: tmdb.id, title: tmdb.title } : null,
    });
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  console.log(`Wrote ${rows.length} films to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
