'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ArticleSearch.module.css';
import axios from '@/lib/axios';

export default function ArticleSearch({ onResults }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // local for suggestions
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const abortRef = useRef(null);

  const handleChange = useCallback((e) => {
    setQ(e.target.value);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      onResults && onResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        const { data } = await axios.get('/articles/search/', {
          params: { q },
          signal: abortRef.current.signal
        });
        setResults(data || []);
        setOpen(true);
        setActiveIndex(-1);
        onResults && onResults(data);
      } catch (e) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
          setResults([]);
          setOpen(false);
          onResults && onResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [q, onResults]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        window.location.href = `/articles/${results[activeIndex].slug}`;
      }
    } else if (e.key === 'Escape') {
      setOpen(false); setActiveIndex(-1);
    }
  };

  const handleResultClick = (slug) => {
    window.location.href = `/articles/${slug}`;
  };

  return (
    <div ref={wrapRef} className={`${styles.container} ${styles.collapsible}`}>
      <div className={styles.searchGroup} tabIndex={0} aria-label="بحث" onKeyDown={handleKeyDown}>
        <img className={styles.searchImg} src="/icons/search.png" alt="" aria-hidden="true" />
        <input
          className={styles.searchInput}
          type="search"
          value={q}
            placeholder="بحث بالعنوان أو الوسوم أو اسم المستخدم..."
          onChange={handleChange}
          onFocus={() => { if (results.length) setOpen(true); }}
        />
        {q && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => { setQ(''); onResults && onResults([]); }}
            aria-label="مسح"
          >
            ✕
          </button>
        )}
      </div>
      {loading && <div className={styles.loading}>جاري البحث...</div>}
      {open && !loading && results.length > 0 && (
        <ul className={styles.suggestions} role="listbox">
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.suggestionItem} ${i === activeIndex ? styles.active : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => handleResultClick(r.slug)}
            >
              <span className={styles.title}>{r.title}</span>
              {r.tags && r.tags.length > 0 && (
                <span className={styles.tags}>{r.tags.slice(0,3).join('، ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {open && !loading && results.length === 0 && q.trim() && (
        <div className={styles.noResults}>لا نتائج</div>
      )}
    </div>
  );
}