import Fuse from "fuse.js";
import raw from "../../db/tmdb.json";
import type { MovieRecord } from "@/types/movie";

const movies = raw as MovieRecord[];

export type FilterState = {
  titleQuery: string;
  yearMin: number;
  yearMax: number;
  durationMin: number;
  durationMax: number;
  genres: string[];
  actors: string[];
  directors: string[];
  countries: string[];
  languages: string[];
  minRating: number;
};

export type FilterOptions = ReturnType<typeof getFilterOptions>;

export function getAllMovies(): MovieRecord[] {
  return movies;
}

export function getMovieByTmdbId(tmdbId: number): MovieRecord | undefined {
  return movies.find((m) => m.tmdbId === tmdbId);
}

/** Splits TMDB-style language strings ("English, French") into distinct labels. */
export function parseLanguagesFromString(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function bump(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function sortByCountDesc(counts: Map<string, number>): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k]) => k);
}

export function getFilterOptions() {
  const genreCounts = new Map<string, number>();
  const actorCounts = new Map<string, number>();
  const directorCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const languageCounts = new Map<string, number>();
  let minRating = 10;
  let maxRating = 0;
  let minYear = 99999;
  let maxYear = 0;
  let minDuration = 999999;
  let maxDuration = 0;

  for (const m of movies) {
    const d = m.details;
    if (d.year < minYear) minYear = d.year;
    if (d.year > maxYear) maxYear = d.year;
    if (d.durationMinutes < minDuration) minDuration = d.durationMinutes;
    if (d.durationMinutes > maxDuration) maxDuration = d.durationMinutes;
    d.genres.forEach((g) => bump(genreCounts, g));
    d.actors.forEach((a) => bump(actorCounts, a.name));
    bump(directorCounts, d.director);
    d.country.forEach((c) => bump(countryCounts, c));
    for (const lang of parseLanguagesFromString(d.language)) {
      bump(languageCounts, lang);
    }
    if (d.rating < minRating) minRating = d.rating;
    if (d.rating > maxRating) maxRating = d.rating;
  }

  return {
    minYear,
    maxYear,
    minDuration,
    maxDuration,
    genres: sortByCountDesc(genreCounts),
    actors: sortByCountDesc(actorCounts),
    directors: sortByCountDesc(directorCounts),
    countries: sortByCountDesc(countryCounts),
    languages: sortByCountDesc(languageCounts),
    minRating: Math.floor(minRating * 10) / 10,
    maxRating: Math.ceil(maxRating * 10) / 10,
  };
}

export function filterMovies(
  list: MovieRecord[],
  filters: FilterState,
  opts: FilterOptions,
): MovieRecord[] {
  const yearActive =
    filters.yearMin > opts.minYear || filters.yearMax < opts.maxYear;
  const durationActive =
    filters.durationMin > opts.minDuration ||
    filters.durationMax < opts.maxDuration;
  const ratingActive = filters.minRating > opts.minRating;

  return list.filter((m) => {
    const d = m.details;
    if (yearActive && (d.year < filters.yearMin || d.year > filters.yearMax))
      return false;
    if (
      durationActive &&
      (d.durationMinutes < filters.durationMin ||
        d.durationMinutes > filters.durationMax)
    )
      return false;
    if (ratingActive && d.rating < filters.minRating) return false;
    if (
      filters.genres.length &&
      !filters.genres.some((g) => d.genres.includes(g))
    )
      return false;
    if (
      filters.actors.length &&
      !filters.actors.some((a) => d.actors.some((x) => x.name === a))
    )
      return false;
    if (filters.directors.length && !filters.directors.includes(d.director))
      return false;
    if (
      filters.countries.length &&
      !filters.countries.some((c) => d.country.includes(c))
    )
      return false;
    if (filters.languages.length) {
      const movieLangs = parseLanguagesFromString(d.language);
      if (!filters.languages.some((l) => movieLangs.includes(l)))
        return false;
    }
    return true;
  });
}

/**
 * Fuzzy title search: tolerates typos and partial input; results are ordered best → worst.
 * Empty query returns the list unchanged.
 */
export function rankMoviesByTitleQuery(
  list: MovieRecord[],
  query: string,
): MovieRecord[] {
  const q = query.trim();
  if (!q) return list;

  const fuse = new Fuse(list, {
    keys: [
      { name: "details.title", weight: 0.82 },
      { name: "tmdbTitle", weight: 0.18 },
    ],
    threshold: 0.48,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: true,
    shouldSort: true,
    distance: 160,
  });

  return fuse.search(q).map((r) => r.item);
}

/** Random pick from top-rated titles so the hero stays interesting on each visit. */
export function getRandomFeaturedMovie(): MovieRecord | undefined {
  if (!movies.length) return undefined;
  const sorted = [...movies].sort((a, b) => b.details.rating - a.details.rating);
  const pool = sorted.slice(0, Math.min(40, sorted.length));
  return pool[Math.floor(Math.random() * pool.length)];
}
