export function getYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s#]+)/,
    /youtu\.be\/([^?\s#]+)/,
    /youtube\.com\/embed\/([^?\s#]+)/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}
