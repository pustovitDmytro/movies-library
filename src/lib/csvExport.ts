import type { MovieRecord } from "@/types/movie";

function escapeCsvField(s: string): string {
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** UTF-8 with BOM for Excel; columns Назва, Рік */
export function downloadMoviesCsv(
  movies: MovieRecord[],
  baseName = "films-library",
): void {
  const header = ["Назва", "Рік"].map(escapeCsvField).join(",");
  const rows = movies.map(
    (m) =>
      `${escapeCsvField(m.details.title)},${m.details.year}`,
  );
  const csv = `\uFEFF${[header, ...rows].join("\r\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${baseName}-${date}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
