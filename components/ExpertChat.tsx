'use client';
// Talk-to-the-expert chat, grounded in S2D's research for one sector. One component, two homes:
//   - full page at /expert/[sector]
//   - in-world overlay when you walk up to that sector's figure in /terrain and press E
// Pass `embedded` + `onClose` for the overlay; omit them for the standalone page.
import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Give me the thesis in three lines.',
  "What's the bull case?",
  'What kills the thesis?',
  'How would S2D express this trade?',
];

export default function ExpertChat({
  sector,
  embedded = false,
  inline = false,
  onClose,
}: {
  sector: string;
  embedded?: boolean;
  inline?: boolean;
  onClose?: () => void;
}) {
  const s = sector.toLowerCase();
  const title = s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReplyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    // While the desk is thinking (or right after you ask), keep the bottom in view.
    // When the answer lands, scroll to the TOP of it so you read from the start, not the tail.
    if (loading || !last || last.role === 'user') {
      el.scrollTop = el.scrollHeight;
    } else if (last.role === 'assistant' && lastReplyRef.current) {
      const top =
        lastReplyRef.current.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
      el.scrollTop = Math.max(0, top - 12);
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!embedded || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [embedded, onClose]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: s, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'request failed');
      setMessages([...next, { role: 'assistant', content: data.content || '(no answer)' }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something broke');
    } finally {
      setLoading(false);
    }
  }

  const card = (
    <div style={embedded ? ST.shellEmbedded : inline ? ST.shellInline : ST.shell}>
      <header style={ST.header}>
        <div>
          <div style={ST.kicker}>S2D CAPITAL · RESEARCH DESK</div>
          <h1 style={ST.title}>The {title} Desk</h1>
          <div style={ST.sub}>
            An analyst fed S2D&apos;s {title.toLowerCase()} research. Ask it anything — it answers from the house view.
          </div>
        </div>
        <div style={ST.headRight}>
          <div style={ST.badge}>● LIVE</div>
          {embedded && onClose && (
            <button aria-label="Close" style={ST.close} onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} style={ST.stream}>
        {messages.length === 0 && (
          <div style={ST.empty}>
            <p style={{ margin: '0 0 14px' }}>
              You&apos;re talking to the {title} expert. Start with one of these, or ask your own:
            </p>
            <div style={ST.chips}>
              {SUGGESTIONS.map((sg) => (
                <button key={sg} style={ST.chip} onClick={() => send(sg)}>
                  {sg}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            ref={i === messages.length - 1 && m.role === 'assistant' ? lastReplyRef : undefined}
            style={{ ...ST.row, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={m.role === 'user' ? ST.userBubble : ST.expertBubble}>
              {m.role === 'assistant' && <div style={ST.who}>{title} Desk</div>}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...ST.row, justifyContent: 'flex-start' }}>
            <div style={ST.expertBubble}>
              <div style={ST.who}>{title} Desk</div>
              <div style={ST.dots}>thinking through the research…</div>
            </div>
          </div>
        )}

        {error && <div style={ST.error}>⚠ {error}</div>}
      </div>

      <form
        style={ST.bar}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          style={ST.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask the ${title} desk…`}
          autoFocus={embedded}
        />
        <button type="submit" style={{ ...ST.sendBtn, opacity: loading || !input.trim() ? 0.45 : 1 }} disabled={loading}>
          Ask
        </button>
      </form>
      <div style={ST.foot}>
        Grounded in <code style={ST.code}>research/{s}.md</code>
        {embedded ? ' · Esc to leave' : ' · not investment advice'}
      </div>
    </div>
  );

  if (embedded) return <div style={ST.backdrop}>{card}</div>;
  if (inline) return card;
  return <main style={ST.page}>{card}</main>;
}

const GOLD = '#d4af6a';
const CYAN = '#7fd4ff';
const ST: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(1200px 700px at 70% -10%, #16213b 0%, #0a0e17 55%)',
    color: '#e6ebf5',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 16px',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    background: 'rgba(4,7,14,0.78)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    color: '#e6ebf5',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  shell: { width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', minHeight: '80vh' },
  shellInline: {
    width: '100%',
    height: 'calc(100vh - 96px)',
    maxHeight: 760,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10,14,23,0.85)',
    border: '1px solid #243250',
    borderRadius: 18,
    padding: 20,
  },
  shellEmbedded: {
    width: '100%',
    maxWidth: 720,
    height: '82vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(10,14,23,0.96)',
    border: '1px solid #243250',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  headRight: { display: 'flex', alignItems: 'center', gap: 10 },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: GOLD, fontWeight: 600, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.4 },
  sub: { fontSize: 14, color: '#8a96ac', maxWidth: 560, lineHeight: 1.5 },
  badge: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#6ee7a0',
    border: '1px solid #214a35',
    background: '#0e2018',
    borderRadius: 999,
    padding: '5px 10px',
    whiteSpace: 'nowrap',
  },
  close: {
    background: 'transparent',
    color: '#8a96ac',
    border: '1px solid #243250',
    borderRadius: 8,
    width: 30,
    height: 30,
    cursor: 'pointer',
    fontSize: 14,
  },
  stream: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 18,
    background: 'rgba(12,18,33,0.6)',
    border: '1px solid #1c2740',
    borderRadius: 16,
  },
  empty: { color: '#9aa6bc', fontSize: 14, margin: 'auto 0' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    background: 'rgba(127,212,255,0.07)',
    color: CYAN,
    border: '1px solid #234055',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
  row: { display: 'flex' },
  userBubble: {
    maxWidth: '78%',
    background: 'rgba(127,212,255,0.12)',
    border: '1px solid #2a4a60',
    color: '#dff1ff',
    borderRadius: '14px 14px 4px 14px',
    padding: '11px 15px',
    fontSize: 14.5,
  },
  expertBubble: {
    maxWidth: '82%',
    background: 'rgba(212,175,106,0.06)',
    border: '1px solid #3a3320',
    borderRadius: '14px 14px 14px 4px',
    padding: '11px 15px',
    fontSize: 14.5,
  },
  who: { fontSize: 10, letterSpacing: 1.5, color: GOLD, fontWeight: 600, marginBottom: 6 },
  dots: { color: '#8a96ac', fontStyle: 'italic' },
  error: { color: '#ff9a9a', fontSize: 13, padding: '8px 4px' },
  bar: { display: 'flex', gap: 10, marginTop: 14 },
  input: {
    flex: 1,
    background: '#0e1524',
    border: '1px solid #243250',
    color: '#e6ebf5',
    borderRadius: 12,
    padding: '13px 16px',
    fontSize: 15,
    outline: 'none',
  },
  sendBtn: {
    background: GOLD,
    color: '#1a1206',
    border: 'none',
    borderRadius: 12,
    padding: '0 22px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  foot: { fontSize: 11.5, color: '#5e6b80', marginTop: 12, textAlign: 'center' },
  code: { color: '#9aa6bc', background: '#0e1524', padding: '1px 6px', borderRadius: 5 },
};
