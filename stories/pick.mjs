// Shortlist easy maths MCQs that fit a story card, for the next week's batch.
//
//   node stories/pick.mjs --out=<scratchpad>/candidates.json [--series=pyqvault|lwspune] [--per-chapter=3]
//
// --series picks the account and so the exam (questions.js SERIES): pyqvault (default) = MHT-CET Maths,
// lwspune = NDA Mathematics. Reads PYQ Vault's question bank with the public anon key (read-only; never
// writes). Keeps public, easy, picture-free MCQs with four text options A–D and one right answer, short
// enough to read in ~5 s, never posted by that account before (every stories/<series>/*/batch.json),
// and spreads them over chapters.
// The shortlist is a draft: re-derive each answer before it goes in batch.json (stories/README.md).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Q = require('./questions.js');
const here = dirname(fileURLToPath(import.meta.url));
const flag = (name, dflt) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? dflt;
const out = flag('out');
const perChapter = Number(flag('per-chapter', '3'));
const seriesName = flag('series', 'pyqvault');
if (!out || !Q.SERIES[seriesName]) {
  console.error(`usage: node stories/pick.mjs --out=<file.json> [--series=${Object.keys(Q.SERIES).join('|')}] [--per-chapter=3]`);
  process.exit(1);
}
const { exam: examName, subject: subjectName } = Q.SERIES[seriesName];

// PYQ Vault sits next to this repo (or next to the folder holding a worktree of it).
function bankEnv() {
  for (let d = here; d !== dirname(d); d = dirname(d)) {
    const f = join(dirname(d), 'Question_Bank', '.env.local');
    if (existsSync(f)) {
      return Object.fromEntries(readFileSync(f, 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
        .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));
    }
  }
  throw new Error('Could not find ../Question_Bank/.env.local');
}
const env = bankEnv();
const base = env.NEXT_PUBLIC_SUPABASE_URL, key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
async function get(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`question bank ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const [exam] = await get(`exams?select=id&name=eq.${encodeURIComponent(examName)}`);
const [subject] = await get(`subjects?select=id&exam_id=eq.${exam.id}&name=eq.${encodeURIComponent(subjectName)}`);
const rows = await get(`questions?select=id,text,solution,pyq_year,cancelled_note,publish_blocked,chapters(name),options(label,text,is_correct,image_url)`
  + `&subject_id=eq.${subject.id}&difficulty=eq.EASY&question_format=eq.mcq&image_url=is.null&visibility=eq.PUBLIC&limit=1000`);

const series = join(here, seriesName);
const used = new Set((existsSync(series) ? readdirSync(series) : []).map((w) => join(series, w, 'batch.json'))
  .filter(existsSync).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).days.map((d) => d.questionId)));

const fits = (text, max) => {
  try { Q.segments(text); } catch { return false; }
  return Q.visibleLength(text) <= max && !Q.examMentions(text).length;
};
const good = rows.filter((r) => {
  const opts = [...r.options].sort((a, b) => a.label.localeCompare(b.label));
  return !used.has(r.id) && !r.cancelled_note && !r.publish_blocked
    && opts.map((o) => o.label).join() === 'A,B,C,D' && opts.every((o) => !o.image_url && fits(o.text, Q.MAX_CHARS.option))
    && opts.filter((o) => o.is_correct).length === 1 && fits(r.text, Q.MAX_CHARS.question);
});

const byChapter = new Map();
for (const r of good) {
  const ch = r.chapters?.name ?? 'Other';
  if (!byChapter.has(ch)) byChapter.set(ch, []);
  byChapter.get(ch).push(r);
}
const shortlist = [...byChapter].flatMap(([chapter, list]) => list.slice(0, perChapter).map((r) => {
  const opts = [...r.options].sort((a, b) => a.label.localeCompare(b.label));
  return {
    questionId: r.id, chapter, question: r.text,
    options: opts.map((o) => ({ label: o.label, text: o.text })),
    bankAnswer: opts.find((o) => o.is_correct).label, bankSolution: r.solution,
  };
}));
writeFileSync(resolve(out), JSON.stringify(shortlist, null, 2) + '\n');
console.log(`${rows.length} easy MCQs read, ${good.length} fit a story, ${byChapter.size} chapters → ${shortlist.length} candidates in ${out}`);
