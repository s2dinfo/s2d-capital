'use client';
import { useState, useEffect, useRef } from 'react';
import { create, search, insert } from '@orama/orama';
import { articles } from '@/lib/articles';

export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [db, setDb] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize search index
  useEffect(() => {
    async function init() {
      const oramaDb = await create({
        schema: {
          title: 'string',
          excerpt: 'string',
          slug: 'string',
          tags: 'string[]',
          published: 'boolean',
        },
      });

      for (const article of articles) {
        await insert(oramaDb, {
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          tags: article.tags,
          published: article.published,
        });
      }

      setDb(oramaDb);
    }
    init();
  }, []);

  // Search on query change
  useEffect(() => {
    if (!db || !query.trim()) {
      setResults([]);
      return;
    }
    async function doSearch() {
      const res = await search(db, { term: query, limit: 5 });
      setResults(res.hits.map((h: any) => h.document));
    }
    doSearch();
  }, [query, db]);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        style={{
          position: 'fixed', bottom: 70, right: 20, zIndex: 50,
          background: 'rgba(15,15,35,0.9)', border: '1px solid rgba(184,134,11,0.3)',
          borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.6)'; e.currentTarget.style.color = 'var(--gold-light)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search
        <span style={{ fontSize: '0.5rem', opacity: 0.5, marginLeft: 4 }}>⌘K</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
      />
      {/* Search modal */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 520, zIndex: 201,
        background: 'rgba(15,15,35,0.98)', border: '1px solid rgba(184,134,11,0.3)',
        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, markets..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#fff',
            }}
          />
          <span onClick={() => setOpen(false)} style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>ESC</span>
        </div>
        {results.length > 0 && (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {results.map((r: any) => (
              <a
                key={r.slug}
                href={`/research/${r.slug}`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: '#fff', marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{r.excerpt?.slice(0, 120)}...</div>
              </a>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
        {!query && (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            Search across all research articles and market pages
          </div>
        )}
      </div>
    </>
  );
}
