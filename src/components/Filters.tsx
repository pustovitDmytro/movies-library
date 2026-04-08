import { useMemo, useState } from "react";
import clsx from "clsx";

export type FilterState = {
  years: number[];
  genres: string[];
  actors: string[];
  minRating: number;
  maxRating: number;
};

type Props = {
  options: {
    years: number[];
    genres: string[];
    actors: string[];
    minRating: number;
    maxRating: number;
  };
  value: FilterState;
  onChange: (next: FilterState) => void;
};

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function Filters({ options, value, onChange }: Props) {
  const [actorQuery, setActorQuery] = useState("");
  const [open, setOpen] = useState(true);

  const filteredActors = useMemo(() => {
    const q = actorQuery.trim().toLowerCase();
    if (!q) return options.actors.slice(0, 80);
    return options.actors.filter((a) => a.toLowerCase().includes(q)).slice(0, 80);
  }, [actorQuery, options.actors]);

  const reset = () => {
    onChange({
      years: [],
      genres: [],
      actors: [],
      minRating: options.minRating,
      maxRating: options.maxRating,
    });
  };

  const hasFilters =
    value.years.length > 0 ||
    value.genres.length > 0 ||
    value.actors.length > 0 ||
    value.minRating !== options.minRating ||
    value.maxRating !== options.maxRating;

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
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto scrollbar-thin rounded-lg border border-white/10 bg-zinc-900/80 p-2">
                {options.years.map((y) => {
                  const on = value.years.includes(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() =>
                        onChange({ ...value, years: toggle(value.years, y) })
                      }
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-medium transition",
                        on
                          ? "bg-netflix-red text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                      )}
                    >
                      {y}
                    </button>
                  );
                })}
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
          </div>
          <div className="w-full shrink-0 space-y-4 lg:w-72">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Rating ({options.minRating.toFixed(1)} –{" "}
                {options.maxRating.toFixed(1)})
              </p>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/80 p-4">
                <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
                  Min
                  <input
                    type="range"
                    min={options.minRating}
                    max={options.maxRating}
                    step={0.1}
                    value={Math.min(value.minRating, value.maxRating)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      onChange({
                        ...value,
                        minRating: Math.min(v, value.maxRating),
                      });
                    }}
                    className="w-full accent-netflix-red"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-400">
                  Max
                  <input
                    type="range"
                    min={options.minRating}
                    max={options.maxRating}
                    step={0.1}
                    value={Math.max(value.minRating, value.maxRating)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      onChange({
                        ...value,
                        maxRating: Math.max(v, value.minRating),
                      });
                    }}
                    className="w-full accent-netflix-red"
                  />
                </label>
              </div>
              <p className="mt-2 text-center text-sm tabular-nums text-zinc-300">
                {value.minRating.toFixed(1)} — {value.maxRating.toFixed(1)}
              </p>
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
