import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filters } from "@/components/Filters";
import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import { downloadMoviesCsv } from "@/lib/csvExport";
import {
  filterMovies,
  getAllMovies,
  getFilterOptions,
  getRandomFeaturedMovie,
  rankMoviesByTitleQuery,
  type FilterState,
} from "@/lib/movies";

export function Home() {
  const navigate = useNavigate();
  const all = getAllMovies();
  const opts = useMemo(() => getFilterOptions(), []);
  const [featured] = useState(() => getRandomFeaturedMovie());

  const [filters, setFilters] = useState<FilterState>(() => ({
    titleQuery: "",
    yearMin: opts.minYear,
    yearMax: opts.maxYear,
    durationMin: opts.minDuration,
    durationMax: opts.maxDuration,
    genres: [],
    actors: [],
    directors: [],
    countries: [],
    languages: [],
    minRating: opts.minRating,
  }));

  const filtered = useMemo(() => {
    const base = filterMovies(all, filters, opts);
    return rankMoviesByTitleQuery(base, filters.titleQuery);
  }, [all, filters, opts]);

  const exportCsv = useCallback(() => {
    if (filtered.length === 0) return;
    void downloadMoviesCsv(filtered);
  }, [filtered]);

  const pickRandom = useCallback(() => {
    if (filtered.length === 0) return;
    const m = filtered[Math.floor(Math.random() * filtered.length)];
    navigate(`/movie/${m.tmdbId}`);
  }, [filtered, navigate]);

  return (
    <>
      {featured && <Hero movie={featured} />}
      <div className="mx-auto flex max-w-[1920px] flex-col lg:flex-row lg:items-start">
        <Filters options={opts} value={filters} onChange={setFilters} />
        <section className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Your library
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {filtered.length} title{filtered.length === 1 ? "" : "s"}
              {filters.titleQuery.trim()
                ? " — best matches first"
                : " match your filters"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              title="Export CSV"
              aria-label="Export CSV"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={pickRandom}
              disabled={filtered.length === 0}
              title="Pick random"
              aria-label="Pick random"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-netflix-red/50 bg-netflix-red/20 text-white transition hover:bg-netflix-red/35 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                aria-hidden
              >
                <g transform="translate(12 12) scale(1.22) translate(-12 -12)">
                <g
                  transform="rotate(-8 12 12)"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  <path d="M12 4.5L19.25 9.25L19.25 16.75L12 21.5L4.75 16.75L4.75 9.25L12 4.5z" />
                  <path d="M12 14.25L12 21.5" />
                  <path d="M4.75 9.25L12 14.25L19.25 9.25" />
                  <circle cx="12" cy="6.1" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="8.2" cy="9.9" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="15.8" cy="9.9" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="12.25" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="9.45" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="6.75" cy="11.65" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="8.85" cy="15.35" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="10.85" cy="18.45" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="16.35" cy="12.55" r="1.05" fill="currentColor" stroke="none" />
                  <circle cx="14.45" cy="17.15" r="1.05" fill="currentColor" stroke="none" />
                </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 bg-zinc-900/50 px-6 py-16 text-center text-zinc-400">
            No films match. Try a different title search, or widen year,
            runtime, rating, or clear genre, country, language, cast, or
            director selections.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {filtered.map((m) => (
              <MovieCard key={`${m.tmdbId}-${m.originalFileName}`} movie={m} />
            ))}
          </div>
        )}
        </section>
      </div>
    </>
  );
}
