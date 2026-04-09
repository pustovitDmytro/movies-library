import raw from "../../db/tmdb.json";
import type { MovieRecord } from "@/types/movie";

const movies = raw as MovieRecord[];

export type FilterState = {
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

export function getFilterOptions() {
  const genres = new Set<string>();
  const actors = new Set<string>();
  const directors = new Set<string>();
  const countries = new Set<string>();
  const languages = new Set<string>();
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
    d.genres.forEach((g) => genres.add(g));
    d.actors.forEach((a) => actors.add(a.name));
    directors.add(d.director);
    d.country.forEach((c) => countries.add(c));
    languages.add(d.language);
    if (d.rating < minRating) minRating = d.rating;
    if (d.rating > maxRating) maxRating = d.rating;
  }

  return {
    minYear,
    maxYear,
    minDuration,
    maxDuration,
    genres: [...genres].sort((a, b) => a.localeCompare(b)),
    actors: [...actors].sort((a, b) => a.localeCompare(b)),
    directors: [...directors].sort((a, b) => a.localeCompare(b)),
    countries: [...countries].sort((a, b) => a.localeCompare(b)),
    languages: [...languages].sort((a, b) => a.localeCompare(b)),
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
    if (filters.languages.length && !filters.languages.includes(d.language))
      return false;
    return true;
  });
}

/** Random pick from top-rated titles so the hero stays interesting on each visit. */
export function getRandomFeaturedMovie(): MovieRecord | undefined {
  if (!movies.length) return undefined;
  const sorted = [...movies].sort((a, b) => b.details.rating - a.details.rating);
  const pool = sorted.slice(0, Math.min(40, sorted.length));
  return pool[Math.floor(Math.random() * pool.length)];
}
