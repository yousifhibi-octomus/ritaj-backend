'use client';
import React from 'react';
import EngineerCard from './EngineerCard';

const mock = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000000),
  first_name: 'أحمد',
  last_name: 'بن علي',
  full_name: 'أحمد بن علي',
  job_title: 'مهندس معماري',
  city: 'الرياض',
  country: { id: 1, name: 'السعودية' },
  company: 'مكتب رؤية',
  years_experience: 7,
  rating: 4.6,
  reviews_count: 23,
  availability: 'available',
  featured_level: 2,
  featured_id: null,
  projects_count: 18,
  specializations: ['تصميم', 'إنشاءات', 'خرسانة'],
  ...overrides,
});

const spanFor = (size) => ({ XS: 2, SM: 3, MD: 4, LG: 6, XL: 12 })[String(size).toUpperCase()] || 4;

const Row = ({ size, title }) => {
  const span = spanFor(size);
  const count = Math.max(1, Math.floor(12 / span));
  const cards = Array.from({ length: count }).map((_, i) => mock({
    id: i + 1 + span * 100,
    featured_level: (i % 5) + 1,
    years_experience: 3 + i,
    rating: 4.2 + (i % 3) * 0.2,
    reviews_count: 12 + i * 3,
    projects_count: 10 + i * 5,
  }));

  return (
    <section style={{ marginBottom: '1.5rem' }} dir="rtl">
      <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
        {title} — span {span}/12
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1rem', width: '100%' }}>
        {cards.map((eng, idx) => (
          <div key={idx} style={{ gridColumn: `span ${span}`, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.75rem' }}>
            <EngineerCard engineer={eng} size={size} variant="linkedin" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default function EngineerCardRows() {
  return (
    <div style={{ padding: '1rem' }}>
      <Row size="XS" title="صف بطاقات XS" />
      <Row size="SM" title="صف بطاقات SM" />
      <Row size="MD" title="صف بطاقات MD" />
      <Row size="LG" title="صف بطاقات LG" />
      <Row size="XL" title="صف بطاقات XL" />
    </div>
  );
}
