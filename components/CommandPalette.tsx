'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './ui';
import { navSections } from './navConfig';

interface Props {
  open: boolean;
  onClose: () => void;
}

const flatItems = navSections.flatMap(section => section.items.map(item => ({ ...item, section: section.label })));

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatItems;
    return flatItems.filter(i => i.name.toLowerCase().includes(q) || i.section.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) { setQuery(''); setActiveIndex(0); }
  }, [open]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); const item = results[activeIndex]; if (item) go(item.path); }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={480} labelledBy="command-palette-title">
      <div onKeyDown={handleKeyDown}>
        <span id="command-palette-title" className="sr-only">Jump to a page</span>
        <div className="flex items-center gap-2.5 -mt-1 -mx-1 px-1 pb-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-4)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Jump to a page…"
            className="flex-1 text-[14px]"
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)' }}
          />
          <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex-shrink-0" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>esc</kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar pt-2 -mx-1 px-1">
          {results.length === 0 ? (
            <p className="text-[12px] py-8 text-center" style={{ color: 'var(--text-4)' }}>No matching pages</p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                onMouseEnter={() => setActiveIndex(i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-colors"
                style={{ background: i === activeIndex ? 'rgba(255,115,0,0.08)' : 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ color: i === activeIndex ? 'var(--orange)' : 'var(--text-4)', flexShrink: 0 }}>{item.icon}</span>
                <span className="text-[13px] font-medium flex-1" style={{ color: 'var(--text-1)' }}>{item.name}</span>
                <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-4)' }}>{item.section}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
