#!/usr/bin/env node
/**
 * Load db/tree.parsed.json, fetch TMDB details per unique tmdb.id, write db/tmdb.json.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PARSED_PATH = join(ROOT, "db", "tree.parsed.json");
const OUT_PATH = join(ROOT, "db", "tmdb.json");
const ENV_PATH = join(ROOT, ".env");

const IMG_BASE = "https://image.tmdb.org/t/p";

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} apiKey
 * @param {number} movieId
 */
async function fetchMovieDetails(apiKey, movieId) {
  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
    append_to_response: "credits,videos,images",
  });
  const url = `https://api.themoviedb.org/3/movie/${movieId}?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * @param {string} filePath
 */
function posterUrl(filePath, size = "w780") {
  if (!filePath || typeof filePath !== "string") return null;
  return `${IMG_BASE}/${size}${filePath}`;
}

function trailerUrlsFromVideos(videos) {
  /** @type {string[]} */
  const out = [];
  if (!videos?.results?.length) return out;
  const list = [...videos.results].filter((v) =>
    ["Trailer", "Teaser", "Clip"].includes(v.type),
  );
  list.sort((a, b) => {
    const o = (b.official ? 1 : 0) - (a.official ? 1 : 0);
    if (o !== 0) return o;
    return (b.size || 0) - (a.size || 0);
  });
  const seen = new Set();
  for (const v of list) {
    let u = null;
    if (v.site === "YouTube" && v.key) {
      u = `https://www.youtube.com/watch?v=${encodeURIComponent(v.key)}`;
    } else if (v.site === "Vimeo" && v.key) {
      u = `https://vimeo.com/${encodeURIComponent(v.key)}`;
    }
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
    if (out.length >= 8) break;
  }
  return out;
}

/**
 * @param {unknown[]} posters
 */
function posterUrlsFromImages(posters, mainPosterPath) {
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  const add = (path) => {
    const u = posterUrl(path, "w780");
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  };
  if (mainPosterPath) add(mainPosterPath);
  if (Array.isArray(posters)) {
    const sorted = [...posters].sort(
      (a, b) => (b.vote_average || 0) - (a.vote_average || 0) || (b.width || 0) - (a.width || 0),
    );
    for (const p of sorted.slice(0, 12)) {
      if (p?.file_path) add(p.file_path);
      if (out.length >= 10) break;
    }
  }
  return out.length ? out : null;
}

/**
 * @param {unknown} data
 */
function mapDetails(data) {
  if (!data || typeof data !== "object") return null;

  const credits = data.credits;
  const videos = data.videos;
  const images = data.images;

  const crew = credits?.crew;
  const directors = Array.isArray(crew)
    ? crew.filter((c) => c && c.job === "Director").map((c) => c.name).filter(Boolean)
    : [];
  const director =
    directors.length === 0 ? null : directors.length === 1 ? directors[0] : directors.join(", ");

  const cast = credits?.cast;
  const actors = Array.isArray(cast)
    ? cast.slice(0, 15).map((c) =>
        c
          ? {
              name: c.name ?? null,
              character: c.character ?? null,
            }
          : null,
      ).filter(Boolean)
    : null;

  const rd = data.release_date;
  let year = null;
  if (typeof rd === "string" && rd.length >= 4) {
    const y = parseInt(rd.slice(0, 4), 10);
    year = Number.isFinite(y) ? y : null;
  }

  const genres = Array.isArray(data.genres)
    ? data.genres.map((g) => (g && g.name ? g.name : null)).filter(Boolean)
    : null;

  const countries = Array.isArray(data.production_countries)
    ? data.production_countries.map((c) => (c && c.name ? c.name : null)).filter(Boolean)
    : null;

  const spokenNames = Array.isArray(data.spoken_languages)
    ? data.spoken_languages
        .map((l) => (l && (l.english_name || l.name) ? l.english_name || l.name : null))
        .filter(Boolean)
    : [];

  const language =
    spokenNames.length > 0
      ? spokenNames.join(", ")
      : typeof data.original_language === "string" && data.original_language
        ? data.original_language
        : null;

  const runtime = data.runtime;
  const durationMinutes =
    typeof runtime === "number" && runtime > 0 ? runtime : null;

  const vc = data.vote_count;
  const rating =
    typeof data.vote_average === "number" && typeof vc === "number" && vc > 0
      ? data.vote_average
      : null;

  const posters = posterUrlsFromImages(images?.posters, data.poster_path);
  const trailers = trailerUrlsFromVideos(videos);
  const trailerList = trailers.length ? trailers : null;

  return {
    title: data.title ?? data.original_title ?? null,
    durationMinutes,
    genres: genres?.length ? genres : null,
    actors: actors?.length ? actors : null,
    year,
    rating,
    posters,
    trailers: trailerList,
    director,
    description: data.overview ?? null,
    country: countries?.length ? countries : null,
    language,
  };
}

async function main() {
  const env = loadEnv(ENV_PATH);
  const apiKey =
    env.TMDB_API_KEY ||
    env.TMBD_API_KEY ||
    process.env.TMDB_API_KEY ||
    process.env.TMBD_API_KEY ||
    "";

  if (!apiKey) {
    console.error("Missing TMDB_API_KEY or TMBD_API_KEY in .env or environment.");
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(PARSED_PATH, "utf8"));
  } catch (e) {
    console.error(`Cannot read ${PARSED_PATH}:`, e);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error("tree.parsed.json must be a JSON array.");
    process.exit(1);
  }

  /** @type {Map<number, Awaited<ReturnType<typeof mapDetails>>>} */
  const cache = new Map();

  for (const row of parsed) {
    const id = row?.tmdb?.id;
    if (typeof id !== "number" || cache.has(id)) continue;
    const raw = await fetchMovieDetails(apiKey, id);
    cache.set(id, mapDetails(raw));
    await sleep(260);
  }

  /** @type {unknown[]} */
  const output = [];
  for (const row of parsed) {
    const id = row?.tmdb?.id;
    const base = {
      originalFileName: row.originalFileName ?? null,
      folder: row.folder ?? null,
      tmdbId: typeof id === "number" ? id : null,
      tmdbTitle: row?.tmdb?.title ?? null,
    };
    if (typeof id !== "number") {
      output.push({ ...base, details: null });
      continue;
    }
    const details = cache.get(id) ?? null;
    output.push({ ...base, details });
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${output.length} rows to ${OUT_PATH} (${cache.size} unique TMDB fetches).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
