import { useState, useCallback, useEffect, useRef, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story, ChildProfile } from '../../types';
import BookCover from './BookCover';
import BookPage from './BookPage';

/* ── Parse story content into paragraph arrays per page ────────── */
const PARAS_PER_PAGE = 4;

function parseStory(content: string): string[][] {
  const paragraphs = content
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  const pages: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += PARAS_PER_PAGE) {
    pages.push(paragraphs.slice(i, i + PARAS_PER_PAGE));
  }
  return pages.length ? pages : [['']];
}

/* ── Hero image path lookup ───────────────────────────────────── */
const HERO_IMAGE_MAP: Record<string, string> = {
  '🦄': '/heroes/unicorn.png',
  '🦉': '/heroes/owl.png',
  '🐉': '/heroes/dragon.png',
  '🧚': '/heroes/fairy.png',
  '🦁': '/heroes/lion.png',
  '🐱': '/heroes/cat.png',
};

/* ── Page-turn animation (CSS classes injected once) ─────────── */
const STYLE_ID = 'book-reader-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes bookMascotFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes bookstar {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes bookPageIn {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes bookPageInReverse {
      from { opacity: 0; transform: translateX(-40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .book-page-enter { animation: bookPageIn 0.35s cubic-bezier(.25,.8,.25,1) forwards; }
    .book-page-enter-reverse { animation: bookPageInReverse 0.35s cubic-bezier(.25,.8,.25,1) forwards; }
  `;
  document.head.appendChild(style);
}

/* ── BookReader ───────────────────────────────────────────────── */
interface BookReaderProps {
  story: Story;
  child?: ChildProfile;
}

type Direction = 'forward' | 'backward';

export default function BookReader({ story, child }: BookReaderProps) {
  const [showCover, setShowCover] = useState(true);
  // page index: 0 = first content page
  const [pageIdx, setPageIdx] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const pages = parseStory(story.content);
  const totalPages = pages.length;
  const heroImage = child ? (HERO_IMAGE_MAP[child.hero.emoji] ?? undefined) : undefined;

  useEffect(() => { injectStyles(); }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCover) { if (e.key === 'Enter' || e.key === ' ') openBook(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const changePage = useCallback((dir: Direction) => {
    setAnimClass(dir === 'forward' ? 'book-page-enter' : 'book-page-enter-reverse');
    setAnimKey(k => k + 1);
  }, []);

  const goNext = useCallback(() => {
    if (pageIdx < totalPages - 1) {
      setPageIdx(p => p + 1);
      changePage('forward');
    }
  }, [pageIdx, totalPages, changePage]);

  const goPrev = useCallback(() => {
    if (pageIdx > 0) {
      setPageIdx(p => p - 1);
      changePage('backward');
    } else {
      // Go back to cover
      setShowCover(true);
    }
  }, [pageIdx, changePage]);

  const openBook = useCallback(() => {
    setShowCover(false);
    setPageIdx(0);
    setAnimClass('book-page-enter');
    setAnimKey(k => k + 1);
  }, []);

  // Touch swipe
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  /* ── Cover ── */
  if (showCover) {
    return <BookCover story={story} child={child} onOpen={openBook} />;
  }

  /* ── Content pages ── */
  const paras = pages[pageIdx] ?? [];
  const isFirst = pageIdx === 0;
  const isLast  = pageIdx === totalPages - 1;

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Animated page */}
      <div key={animKey} className={animClass} style={{ minHeight: '100vh' }}>
        <BookPage
          paragraphs={paras}
          pageNumber={pageIdx + 1}
          totalPages={totalPages}
          storyTitle={story.title}
          question={story.question}
          imageUrl={story.imageUrl}
          heroImage={heroImage}
          child={child}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>

      {/* Navigation overlay — bottom of screen */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(76,29,149,0.88)',
        backdropFilter: 'blur(10px)',
        borderRadius: 50,
        padding: '8px 16px',
        boxShadow: '0 4px 20px rgba(76,29,149,0.35)',
        zIndex: 100,
      }}>
        <button
          onClick={goPrev}
          disabled={pageIdx === 0 && false /* allow going to cover */}
          style={navBtnStyle}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft size={18} color="#fff" />
        </button>

        {/* Page dots */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {pages.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                const dir = i > pageIdx ? 'forward' : 'backward';
                setPageIdx(i);
                changePage(dir);
              }}
              style={{
                width: i === pageIdx ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: i === pageIdx ? '#F9D56E' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={pageIdx === totalPages - 1}
          style={{ ...navBtnStyle, opacity: pageIdx === totalPages - 1 ? 0.35 : 1 }}
          aria-label="Следующая страница"
        >
          <ChevronRight size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s',
};
