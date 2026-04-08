import raw from "../../db/tmdb.json";
import type { MovieRecord } from "@/types/movie";

const movies = raw as MovieRecord[];

export function getAllMovies(): MovieRecord[] {
  return movies;
}

export function getMovieByTmdbId(tmdbId: number): MovieRecord | undefined {
  return movies.find((m) => m.tmdbId === tmdbId);
}

export function getFilterOptions() {
  const years = new Set<number>();
  const genres = new Set<string>();
  const actors = new Set<string>();
  let minRating = 10;
  let maxRating = 0;

  for (const m of movies) {
    const d = m.details;
    years.add(d.year);
    d.genres.forEach((g) => genres.add(g));
    d.actors.forEach((a) => actors.add(a.name));
    if (d.rating < minRating) minRating = d.rating;
    if (d.rating > maxRating) maxRating = d.rating;
  }

  return {
    years: [...years].sort((a, b) => b - a),
    genres: [...genres].sort((a, b) => a.localeCompare(b)),
    actors: [...actors].sort((a, b) => a.localeCompare(b)),
    minRating: Math.floor(minRating * 10) / 10,
    maxRating: Math.ceil(maxRating * 10) / 10,
  };
}

export function filterMovies(
  list: MovieRecord[],
  opts: {
    years: number[];
    genres: string[];
    actors: string[];
    minRating: number;
    maxRating: number;
  },
): MovieRecord[] {
  return list.filter((m) => {
    const d = m.details;
    if (opts.years.length && !opts.years.includes(d.year)) return false;
    if (opts.genres.length && !opts.genres.some((g) => d.genres.includes(g)))
      return false;
    if (
      opts.actors.length &&
      !opts.actors.some((a) => d.actors.some((x) => x.name === a))
    )
      return false;
    if (d.rating < opts.minRating || d.rating > opts.maxRating) return false;
    return true;
  });
}

export function getFeaturedMovie(): MovieRecord | undefined {
  if (!movies.length) return undefined;
  const sorted = [...movies].sort((a, b) => b.details.rating - a.details.rating);
  return sorted[0];
}
