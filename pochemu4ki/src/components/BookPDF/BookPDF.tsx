import { Fragment } from 'react';
import { Document } from '@react-pdf/renderer';
import './fonts';
import type { Story, ChildProfile } from '../../types';
import { HERO } from './constants';
import { BookCover } from './pages/BookCover';
import { BookEndpaper } from './pages/BookEndpaper';
import { BookToC } from './pages/BookToC';
import { BookChapterDivider } from './pages/BookChapterDivider';
import { BookStoryPage } from './pages/BookStoryPage';
import { BookBackCover } from './pages/BookBackCover';

interface BookDocumentProps {
  title: string;
  child: ChildProfile;
  stories: Story[];
  baseUrl: string;
  /** Pre-compressed image data URLs keyed by full URL string (optional, falls back to baseUrl) */
  imageMap?: Record<string, string>;
}

export function BookDocument({ title, child, stories, baseUrl, imageMap }: BookDocumentProps) {
  const m = (name: string) => {
    const url = `${baseUrl}/assets/mascot/${name}`;
    return imageMap?.[url] ?? url;
  };
  const resolveHeroUrl = (story: Story): string | null => {
    // 1. Custom hero image URL (uploaded or pasted)
    if (story.heroUsed?.imageUrl) {
      return imageMap?.[story.heroUsed.imageUrl] ?? story.heroUsed.imageUrl;
    }
    // 2. Standard emoji hero from this story (🦄 🦉 🐉 etc.)
    if (story.heroUsed?.emoji && HERO[story.heroUsed.emoji]) {
      const raw = `${baseUrl}${HERO[story.heroUsed.emoji]}`;
      return imageMap?.[raw] ?? raw;
    }
    // 3. Fall back to child's default hero (covers custom heroes with no image, e.g. emoji ✨)
    if (child.hero?.emoji && HERO[child.hero.emoji]) {
      const raw = `${baseUrl}${HERO[child.hero.emoji]}`;
      return imageMap?.[raw] ?? raw;
    }
    return null;
  };

  const tocOffset = stories.length > 1 ? 1 : 0;
  // First story text page: cover(1) + endpaper(1) + toc(0|1) + per-story divider
  // page numbers start at 1. story text page = 4 + tocOffset + idx*2
  const firstTextPage = 4 + tocOffset; // page num for idx=0

  return (
    <Document title={title} author="Почему-Ка!" subject={`Сборник сказок для ${child.name}`} creator="pochemu4ki-app.onrender.com">

      {/* 1. Front cover */}
      <BookCover child={child} stories={stories} mascotUrl={m('mascot-logo.png')} />

      {/* 2. Endpaper */}
      <BookEndpaper />

      {/* 3. Table of Contents (only for 2+ stories) */}
      {stories.length > 1 && (
        <BookToC
          stories={stories}
          mascotThinkUrl={m('mascot-think.png')}
          mascotCalmUrl={m('mascot-calm.png')}
          tocPageOffset={firstTextPage}
        />
      )}

      {/* 4. Story pages: divider + text */}
      {stories.map((story, idx) => (
        <Fragment key={story.id}>
          <BookChapterDivider
            title={story.title}
            chapterIndex={idx + 1}
            mascotUrl={m('mascot-surprise.png')}
            mascotCalmUrl={m('mascot-calm.png')}
          />
          <BookStoryPage
            story={story}
            child={child}
            heroUrl={resolveHeroUrl(story)}
            pageNum={4 + tocOffset + idx * 2}
            mascotExplainUrl={m('mascot-explain.png')}
            mascotHeroUrl={m('mascot-hero.png')}
            mascotJoyUrl={m('mascot-joy.png')}
            mascotCalmUrl={m('mascot-calm.png')}
          />
        </Fragment>
      ))}

      {/* 5. Back cover */}
      <BookBackCover mascotUrl={m('mascot-calm.png')} />

    </Document>
  );
}
