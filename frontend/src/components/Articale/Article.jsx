'use client';

import React ,{useState} from 'react';
import styles from './Article.module.css';
import Image from 'next/image';
import Link from 'next/link';
import SocialIcons from '../SocialIcons';
import ImageSection from '../ImageSection';
import SaveArticalButton from '../SaveArticalButton';
import Highlight from '../HightLight/Highlight';

const Article = ({ article , isRequest }) => {
    const authorName = article.author?.name || article.author_name || "مجهول";
const remaining = [];

const photographerName =
    typeof article.photographer === 'string'
      ? article.photographer
      : (article.photographer?.name || article.photographer_name || '');
  const photographerSlug =
    typeof article.photographer === 'string'
      ? article.photographer
      : (article.photographer?.username || article.photographer_slug || photographerName);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);


  const lines = article.text.split('\n').filter(line => line.trim() !== '');
  const paragraphs = [];
  for (let i = 0; i < lines.length; i += 2) {
    // Join 3 lines into one paragraph with \n between
    paragraphs.push(lines.slice(i, i + 2).join('\n'));
  }
  // Normalize images from backend: can be strings or objects { url, alt }
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
  const toAbsolute = (src) => {
    if (!src) return '';
    if (typeof src !== 'string') return '';
    if (src.startsWith('http')) return src;
    if (src.startsWith('/media')) return `${API_BASE}${src}`;
    return src;
  };
  const images = (article.images || []).map((img) => {
    if (typeof img === 'string') return { url: toAbsolute(img), alt: '' };
    if (img && typeof img === 'object') {
      const url = toAbsolute(img.url || img.image || '');
      return { url, alt: img.alt || '' };
    }
    return { url: '', alt: '' };
  });

  return (
    <article className={styles.article}>
       {/* Top Ad Area */}
      {isRequest && ( <div className={styles.adTop}>  
        {/* Replace this div with your ad component or iframe */}
        <p>Ad Area (Top)</p>
      </div>)}

     {/* Title */}
      <h1 className={styles.title}>{article.title}</h1>

      {/* Author and Date */}
      <div className={styles.meta}>
        <span className={styles.date}> {article.date} |  </span>

        <span className={styles.author}>
          <Link href={`/profile/${authorName}`}>{authorName}</Link>
        </span>
      </div>
        {article.source && (
      <div className={styles.meta}>
        <span className={styles.source}>
          <Link href={`/source/${article.source}`}>{article.source}</Link>
        </span>
        <span className={styles.date}>  :المصدر</span>
        
      </div>
    )}

      {/* Header Image */}
      {article.headerImage && (
        <div className={styles.headerImageWrapper}>
          <img src={article.headerImage} alt={article.title} className={styles.headerImage} />
        </div>
      )}



      {/* Body content with interleaved images */}
<div className={styles.content}>
  {paragraphs.map((paragraph, index) => {
    const remaining = paragraphs.length - (index + 1);

    // Determine if this is the middle index
    const isMiddle = index === Math.floor(paragraphs.length / 2);

    return (
      <div key={index} className={styles.section}>
        {/* First paragraph */}
        <p className={styles.paragraph}>{paragraph}</p>

        {/* Insert highlight area after first paragraph if middle */}
        {isMiddle && (
          <Highlight article={article} />
        )}

        {/* Render the next paragraph if middle */}
        {isMiddle && paragraphs[index + 1] && (
          <p className={styles.paragraph}>{paragraphs[index + 1]}</p>
        )}

        {/* Show image after the highlight/second paragraph */}
        {images[index]?.url && remaining > 1 && (
          <div className={styles.sectionImageWrapper}>
            <img
              src={images[index].url}
              alt={images[index].alt || `Image ${index + 1}`}
              className={styles.sectionImage}
            />
          </div>
        )}
      </div>
    );
  })}
</div>
  {/* Photographer credit */}
      {photographerName?.trim() && (
        <div className={styles.meta}>
          
          <span className={styles.author}>
            <Link href={`/profile/${encodeURIComponent(photographerSlug)}`}>{photographerName}</Link>
          </span>
          <span className={styles.date}>   , التصوير من إعداد </span>
        </div>
      )}

      {/* Tags */}
      <div className={styles.tags}>
        {article.tags && article.tags.map((tag, index) => (
          <Link key={index} href={`/projects/${encodeURIComponent(tag)}`} className={styles.tag}>
            #{tag}
          </Link>
        ))}
      </div>
      <div className={styles.actions}>
         {/* Inline Ad after meta */}
      
  {/* Save Button */}
    <SaveArticalButton
      articleId={article.id}
      initialSaved={article.is_saved}
      initialCount={article.saves_count}
    />

  {/* Comment Button */}
  <button
    className={styles.Btnss}
    onClick={() => {
      const comments = document.getElementById('comments-section');
      if (comments) {
        comments.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }}
  >
    أضف تعليق
    <img src="/icons/comment.png" className={styles.icons} />
  </button>
</div>
        {/* share Buttons */}
        <div className={styles.share}>
          <div className={styles.socialIcons}>
          <SocialIcons color='#c9338e' />
          </div>
          <button
            className={styles.Btnss}
          >
            شارك المقال
             <img src="/icons/share.png" className={styles.icons} />
          </button>
      
          
        </div>
  <ImageSection article={article} images={images.slice(paragraphs.length)} />
    {isRequest && ( <div className={styles.adInline}>
        <p>Ad Area (Inline after meta)</p>
      </div>
    )}
    </article>

  );
};
export default Article;