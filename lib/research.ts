// Reads a sector's research markdown (research/<slug>.md) and turns the PDF-extracted text into
// clean, renderable blocks. The source files are frontmatter + prose: numbered section headings
// ("1.", "2.1", "2.1.1") and paragraphs that are hard-wrapped across lines (a PDF artefact), so
// we rejoin wrapped lines into paragraphs and lift the numbered lines into real headings.
import { readFile, readdir } from 'fs/promises';
import path from 'path';

export type Block = { type: 'h2' | 'h3' | 'h4' | 'p'; text: string };
export type Research = {
  slug: string;
  title: string;
  sector: string;
  desk: string;
  blocks: Block[];
};

const DIR = path.join(process.cwd(), 'research');
// "1. Title" / "2.1 Title" / "2.1.1 Title" at the start of a line — the section headings.
const HEADING = /^(\d+(?:\.\d+)*)\.?\s+([A-Z].*)$/;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\s*/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: raw.slice(m[0].length) };
}

function toTitleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseBody(body: string): { title: string; blocks: Block[] } {
  const blocks: Block[] = [];
  let para: string[] = [];
  let title = '';
  const flush = () => {
    if (!para.length) return;
    const text = para.join(' ').replace(/\s+/g, ' ').trim();
    if (text) blocks.push({ type: 'p', text });
    para = [];
  };
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = line.match(HEADING);
    if (h) {
      flush();
      const depth = h[1].split('.').length;
      blocks.push({ type: depth <= 1 ? 'h2' : depth === 2 ? 'h3' : 'h4', text: h[2].trim() });
      continue;
    }
    // The first substantial non-heading line is the document title.
    if (!title && line.length > 8) {
      title = line;
      continue;
    }
    para.push(line);
  }
  flush();
  return { title, blocks };
}

export async function loadResearch(slug: string): Promise<Research | null> {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!clean || clean.startsWith('_') || clean.includes('.')) return null;
  let raw: string;
  try {
    raw = await readFile(path.join(DIR, `${clean}.md`), 'utf8');
  } catch {
    return null;
  }
  const { meta, body } = parseFrontmatter(raw);
  const { title, blocks } = parseBody(body);
  return {
    slug: clean,
    title: title || `An Introduction to ${toTitleCase(clean)} Markets`,
    sector: meta.sector || toTitleCase(clean),
    desk: meta.desk || 'S2D Capital',
    blocks,
  };
}

// Slugs of every live desk (research/*.md, excluding _house and .house overlays).
export async function researchSlugs(): Promise<string[]> {
  let files: string[] = [];
  try {
    files = await readdir(DIR);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && !f.includes('.house.'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}
