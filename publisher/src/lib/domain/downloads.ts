// Download buttons on a post card (founder, 2026-10-30): a reel that needs Instagram's own audio ("Use audio") is posted
// by hand from the phone, so its file has to get there. The page signs each stored file a second time with Supabase's
// `download` option (the browser saves it instead of playing it, under the stored file name, e.g. the reel's slug);
// these rules decide which files get a button and what each says. The media bucket stays private: the links last an hour.
type Stored = { video_path: string | null; cover_path: string | null; slide_paths: string[] | null };
export type Download = { label: string; file: string; url: string };

/** Every stored file of the posts on screen, once (one signing call for the page). */
export function downloadPaths(posts: Stored[]): string[] {
  return [...new Set(posts.flatMap((p) => [p.video_path, p.cover_path, ...(p.slide_paths ?? [])]).filter((x): x is string => !!x))];
}

const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** A post's download buttons: the video, then the cover, then each slide; a file whose link couldn't be made is left out. */
export function mediaDownloads(post: Stored, links: Map<string, string>): Download[] {
  const items: [string, string | null][] = [
    ["Download video", post.video_path],
    ["Download cover", post.cover_path],
    ...(post.slide_paths ?? []).map((p, i): [string, string] => [`Download slide ${i + 1}`, p]),
  ];
  return items.flatMap(([label, path]) => (path && links.get(path) ? [{ label, file: fileName(path), url: links.get(path)! }] : []));
}
