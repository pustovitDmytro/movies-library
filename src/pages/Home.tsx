import { useMemo, useState } from "react";
import { Filters } from "@/components/Filters";
import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import {
  filterMovies,
  getAllMovies,
  getFilterOptions,
  getRandomFeaturedMovie,
  rankMoviesByTitleQuery,
  type FilterState,
} from "@/lib/movies";

export function Home() {
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
