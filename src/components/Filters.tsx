import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { FilterOptions, FilterState } from "@/lib/movies";

export type { FilterState } from "@/lib/movies";

type Props = {
  options: FilterOptions;
  value: FilterState;
  onChange: (next: FilterState) => void;
};

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function pct(v: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((v - min) / (max - min)) * 100;
}

function useIsLg() {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const fn = () => setIsLg(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return isLg;
}

function DualRange({
  min,
  max,
  low,
  high,
  step,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  step: number;
  onChange: (low: number, high: number) => void;
}) {
  const lo = Math.min(low, high);
  const hi = Math.max(low, high);
  const range = max - min || 1;

  return (
    <div className="dual-range">
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 w-full -translate-y-1/2">
        <div className="relative h-1.5 w-full">
          <div className="absolute inset-0 rounded-full bg-zinc-800" />
          <div
            className="absolute top-0 h-1.5 rounded-full bg-netflix-red/70"
            style={{
              left: `${pct(lo, min, max)}%`,
              width: `${((hi - lo) / range) * 100}%`,
            }}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Math.min(v, hi), hi);
        }}
        className="z-[1]"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(lo, Math.max(v, lo));
        }}
        className="z-[2]"
      />
    </div>
  );
}

function activeFilterCount(value: FilterState, options: FilterOptions): number {
  let n = 0;
  if (value.titleQuery.trim()) n++;
  if (value.yearMin !== options.minYear || value.yearMax !== options.maxYear)
    n++;
  if (
    value.durationMin !== options.minDuration ||
    value.durationMax !== options.maxDuration
  )
    n++;
  if (value.genres.length) n++;
  if (value.actors.length) n++;
  if (value.directors.length) n++;
  if (value.countries.length) n++;
  if (value.languages.length) n++;
  if (value.minRating !== options.minRating) n++;
  return n;
}

export function Filters({ options, value, onChange }: Props) {
  const isLg = useIsLg();
  const [panelOpen, setPanelOpen] = useState(false);
  const showPanel = isLg || panelOpen;
  const active = useMemo(
    () => activeFilterCount(value, options),
    [value, options],
  );

  const [actorQuery, setActorQuery] = useState("");
  const [directorQuery, setDirectorQuery] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");

  const filteredActors = useMemo(() => {
    const q = actorQuery.trim().toLowerCase();
    if (!q) return options.actors.slice(0, 80);
    return options.actors
      .filter((a) => a.toLowerCase().includes(q))
      .slice(0, 80);
  }, [actorQuery, options.actors]);

  const filteredDirectors = useMemo(() => {
    const q = directorQuery.trim().toLowerCase();
    if (!q) return options.directors.slice(0, 80);
    return options.directors
      .filter((d) => d.toLowerCase().includes(q))
      .slice(0, 80);
  }, [directorQuery, options.directors]);

  const filteredLanguages = useMemo(() => {
    const q = languageQuery.trim().toLowerCase();
    if (!q) return options.languages;
    return options.languages.filter((l) => l.toLowerCase().includes(q));
  }, [languageQuery, options.languages]);

  const reset = () => {
    onChange({
      titleQuery: "",
      yearMin: options.minYear,
      yearMax: options.maxYear,
      durationMin: options.minDuration,
      durationMax: options.maxDuration,
      genres: [],
      actors: [],
      directors: [],
      countries: [],
      languages: [],
      minRating: options.minRating,
    });
  };

  const hasFilters =
    value.titleQuery.trim().length > 0 ||
    value.yearMin !== options.minYear ||
    value.yearMax !== options.maxYear ||
    value.durationMin !== options.minDuration ||
    value.durationMax !== options.maxDuration ||
    value.genres.length > 0 ||
    value.actors.length > 0 ||
    value.directors.length > 0 ||
    value.countries.length > 0 ||
    value.languages.length > 0 ||
    value.minRating !== options.minRating;

  const searchInput = (
    <div className="relative min-w-0 flex-1">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        aria-hidden
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
      <input
        id="title-search"
        type="search"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search title…"
        value={value.titleQuery}
        onChange={(e) => onChange({ ...value, titleQuery: e.target.value })}
        className={clsx(
          "w-full rounded-xl border border-white/10 bg-zinc-900/90 py-2 pl-9 text-sm text-white shadow-inner shadow-black/30 placeholder:text-zinc-500 focus:border-netflix-red/60 focus:outline-none focus:ring-2 focus:ring-netflix-red/30",
          value.titleQuery.trim().length > 0 ? "pr-14" : "pr-3",
        )}
      />
      {value.titleQuery.trim().length > 0 && (
        <button
          type="button"
          onClick={() => onChange({ ...value, titleQuery: "" })}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          Clear
        </button>
      )}
    </div>
  );

  const filterBody = (
    <div className="space-y-3 px-3 pb-4 pt-1 lg:space-y-3 lg:px-0 lg:pb-0 lg:pt-0">
      <div className="grid gap-3 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 px-3 py-2.5 ring-1 ring-white/5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Year
          </p>
          <DualRange
            min={options.minYear}
            max={options.maxYear}
            low={value.yearMin}
            high={value.yearMax}
            step={1}
            onChange={(yearMin, yearMax) =>
              onChange({ ...value, yearMin, yearMax })
            }
          />
          <p className="mt-2 text-center text-xs tabular-nums text-zinc-300">
            {value.yearMin} — {value.yearMax}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 px-3 py-2.5 ring-1 ring-white/5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Runtime (min)
          </p>
          <DualRange
            min={options.minDuration}
            max={options.maxDuration}
            low={value.durationMin}
            high={value.durationMax}
            step={1}
            onChange={(durationMin, durationMax) =>
              onChange({ ...value, durationMin, durationMax })
            }
          />
          <p className="mt-2 text-center text-xs tabular-nums text-zinc-300">
            {value.durationMin} — {value.durationMax} min
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Genres
        </p>
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          {options.genres.map((g) => {
            const on = value.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() =>
                  onChange({ ...value, genres: toggle(value.genres, g) })
                }
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  on
                    ? "bg-netflix-red text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Countries
        </p>
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          {options.countries.map((c) => {
            const on = value.countries.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    countries: toggle(value.countries, c),
                  })
                }
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  on
                    ? "bg-netflix-red text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Languages
        </p>
        <input
          type="search"
          placeholder="Search…"
          value={languageQuery}
          onChange={(e) => setLanguageQuery(e.target.value)}
          className="mb-1.5 w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
        />
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          {filteredLanguages.map((lang) => {
            const on = value.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    languages: toggle(value.languages, lang),
                  })
                }
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  on
                    ? "bg-netflix-red text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                )}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Actors
        </p>
        <input
          type="search"
          placeholder="Search…"
          value={actorQuery}
          onChange={(e) => setActorQuery(e.target.value)}
          className="mb-1.5 w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
        />
        <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          {filteredActors.map((a) => {
            const on = value.actors.includes(a);
            return (
              <button
                key={a}
                type="button"
                title={a}
                onClick={() =>
                  onChange({ ...value, actors: toggle(value.actors, a) })
                }
                className={clsx(
                  "max-w-full truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  on
                    ? "bg-netflix-red text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Directors
        </p>
        <input
          type="search"
          placeholder="Search…"
          value={directorQuery}
          onChange={(e) => setDirectorQuery(e.target.value)}
          className="mb-1.5 w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
        />
        <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          {filteredDirectors.map((d) => {
            const on = value.directors.includes(d);
            return (
              <button
                key={d}
                type="button"
                title={d}
                onClick={() =>
                  onChange({
                    ...value,
                    directors: toggle(value.directors, d),
                  })
                }
                className={clsx(
                  "max-w-full truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium transition",
                  on
                    ? "bg-netflix-red text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                )}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Min rating ≥ {value.minRating.toFixed(1)}
        </p>
        <input
          type="range"
          min={options.minRating}
          max={options.maxRating}
          step={0.1}
          value={value.minRating}
          onChange={(e) =>
            onChange({
              ...value,
              minRating: Number(e.target.value),
            })
          }
          className="w-full accent-netflix-red"
        />
        <p className="mt-1.5 text-center text-[10px] text-zinc-500">
          {options.minRating.toFixed(1)}–{options.maxRating.toFixed(1)} in
          library
        </p>
      </div>

      <button
        type="button"
        onClick={reset}
        disabled={!hasFilters}
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-xs font-semibold transition",
          hasFilters
            ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
            : "cursor-not-allowed border-white/5 text-zinc-600",
        )}
      >
        Reset filters
      </button>
    </div>
  );

  return (
    <aside
      className={clsx(
        "w-full shrink-0 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md lg:sticky lg:top-14 lg:flex lg:w-[min(100%,20rem)] lg:max-h-[calc(100vh-3.5rem)] lg:flex-col lg:self-start lg:overflow-hidden lg:border-b-0 lg:border-r xl:w-[22rem]",
      )}
    >
      {/* Mobile / tablet: search + toggle */}
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5 sm:px-4 lg:hidden">
        {searchInput}
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="relative flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          aria-expanded={showPanel}
        >
          Filters
          {active > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-netflix-red px-1 text-[10px] font-bold text-white">
              {active > 99 ? "99+" : active}
            </span>
          )}
          <svg
            className={clsx(
              "h-4 w-4 text-zinc-400 transition",
              showPanel && !isLg && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Collapsible on small screens */}
      <div
        className={clsx(
          "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
          !showPanel && "hidden lg:flex",
        )}
      >
        <div className="hidden border-b border-white/5 px-3 py-3 lg:block">
          <label
            htmlFor="title-search-desktop"
            className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Search titles
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              id="title-search-desktop"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search title…"
              value={value.titleQuery}
              onChange={(e) =>
                onChange({ ...value, titleQuery: e.target.value })
              }
              className={clsx(
                "w-full rounded-xl border border-white/10 bg-zinc-900/90 py-2 pl-9 pr-3 text-sm text-white shadow-inner placeholder:text-zinc-500 focus:border-netflix-red/60 focus:outline-none focus:ring-2 focus:ring-netflix-red/30",
                value.titleQuery.trim().length > 0 ? "pr-14" : "",
              )}
            />
            {value.titleQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...value, titleQuery: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div
          className={clsx(
            "overflow-y-auto overscroll-contain lg:flex-1 lg:px-3 lg:pt-1",
            !isLg && "max-h-[min(58vh,420px)] border-b border-white/5",
          )}
        >
          {filterBody}
        </div>
      </div>
    </aside>
  );
}
