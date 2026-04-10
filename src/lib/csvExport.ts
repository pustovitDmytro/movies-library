import type { MovieRecord } from "@/types/movie";

function escapeCsvField(s: string): string {
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildMoviesCsvBlob(movies: MovieRecord[]): Blob {
  const header = ["Назва", "Рік"].map(escapeCsvField).join(",");
  const rows = movies.map(
    (m) =>
      `${escapeCsvField(m.details.title)},${m.details.year}`,
  );
  const csv = `\uFEFF${[header, ...rows].join("\r\n")}`;
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

function triggerAnchorDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** UTF-8 with BOM for Excel; columns Назва, Рік. Uses Web Share on mobile when downloads are unreliable. */
export async function downloadMoviesCsv(
  movies: MovieRecord[],
  baseName = "films-library",
): Promise<void> {
  const blob = buildMoviesCsvBlob(movies);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${baseName}-${date}.csv`;
  const file = new File([blob], filename, { type: "text/csv" });

  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (
    nav?.share &&
    nav.canShare?.({ files: [file] }) === true
  ) {
    try {
      await nav.share({
        files: [file],
        title: filename,
      });
      return;
    } catch (e) {
      const err = e as { name?: string };
      if (err?.name === "AbortError") return;
    }
  }

  triggerAnchorDownload(blob, filename);
}
