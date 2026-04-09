import { useMemo, useState } from "react";
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

export function Filters({ options, value, onChange }: Props) {
  const [actorQuery, setActorQuery] = useState("");
  const [directorQuery, setDirectorQuery] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");
  const [open, setOpen] = useState(true);

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

  return (
    <div className="border-b border-white/5 bg-black/40">
      <div className="mx-auto max-w-[1920px] px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left sm:hidden"
        >
          <span className="text-sm font-semibold text-white">Filters</span>
          <span className="text-zinc-500">{open ? "Hide" : "Show"}</span>
        </button>
        <div
          className={clsx(
            "mt-0 flex flex-col gap-6 lg:flex-row lg:items-start",
            !open && "hidden sm:flex",
          )}
        >
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Year
              </p>
              <div className="rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-4">
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
                <p className="mt-3 text-center text-sm tabular-nums text-zinc-300">
                  {value.yearMin} — {value.yearMax}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Runtime (minutes)
              </p>
              <div className="rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-4">
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
                <p className="mt-3 text-center text-sm tabular-nums text-zinc-300">
                  {value.durationMin} — {value.durationMax} min
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Genres
              </p>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
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
                        "rounded-full px-3 py-1 text-xs font-medium transition",
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Countries
              </p>
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
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
                        "rounded-full px-3 py-1 text-xs font-medium transition",
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Languages
              </p>
              <input
                type="search"
                placeholder="Search languages…"
                value={languageQuery}
                onChange={(e) => setLanguageQuery(e.target.value)}
                className="mb-2 w-full max-w-md rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
              />
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
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
                        "rounded-full px-3 py-1 text-xs font-medium transition",
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Actors
              </p>
              <input
                type="search"
                placeholder="Search actors…"
                value={actorQuery}
                onChange={(e) => setActorQuery(e.target.value)}
                className="mb-2 w-full max-w-md rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
              />
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
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
                        "max-w-full truncate rounded-full px-3 py-1 text-xs font-medium transition",
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Directors
              </p>
              <input
                type="search"
                placeholder="Search directors…"
                value={directorQuery}
                onChange={(e) => setDirectorQuery(e.target.value)}
                className="mb-2 w-full max-w-md rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
              />
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
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
                        "max-w-full truncate rounded-full px-3 py-1 text-xs font-medium transition",
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
          </div>
          <div className="w-full shrink-0 space-y-4 lg:w-72">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Minimum rating (≥ {value.minRating.toFixed(1)})
              </p>
              <div className="rounded-lg border border-white/10 bg-zinc-900/80 px-4 py-4">
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
                <p className="mt-2 text-center text-xs text-zinc-500">
                  Show titles with rating at least {value.minRating.toFixed(1)}{" "}
                  (library range {options.minRating.toFixed(1)}–
                  {options.maxRating.toFixed(1)})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={!hasFilters}
              className={clsx(
                "w-full rounded-md border px-4 py-2.5 text-sm font-semibold transition",
                hasFilters
                  ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                  : "cursor-not-allowed border-white/5 text-zinc-600",
              )}
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
