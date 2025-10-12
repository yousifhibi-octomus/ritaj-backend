"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './FiltersBar.module.css';

export default function FiltersBar(){
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [audience, setAudience] = useState(params.get('audience') || '');
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(()=>{
    const t = setTimeout(()=>{
      const search = new URLSearchParams();
      if(status) search.set('status', status);
      if(category) search.set('category', category);
      if(audience) search.set('audience', audience);
      if(q) search.set('q', q);
      const qs = search.toString();
      router.push(`/competitions${qs ? '?' + qs : ''}`);
    }, 400);
    return ()=>clearTimeout(t);
  }, [status, category, audience, q, router]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.selectGroup}>
        <Select value={status} onChange={setStatus} label="الحالة" options={[
          ['','الكل'], ['upcoming','قادمة'], ['active','نشطة'], ['completed','مكتملة'], ['cancelled','ملغاة']
        ]} />
        <Select value={category} onChange={setCategory} label="الفئة" options={[
          ['','الكل'], ['architectural_design','تصميم معماري'], ['urban_planning','تخطيط عمراني'], ['housing','الإسكان'], ['restoration','الترميم'], ['ideas','أفكار']
        ]} />
        <Select value={audience} onChange={setAudience} label="الجمهور" options={[
          ['','الكل'], ['professionals','محترفون'], ['students','طلاب'], ['open','مفتوحة']
        ]} />
      </div>
      <div className={styles.searchBox}>
        <input
          value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="ابحث عن مسابقة..."
            className={styles.searchInput}
        />
      </div>
    </div>
  );
}

function Select({ value, onChange, options, label }){
  const id = React.useId();
  return (
    <label className={styles.label} htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={e=>onChange(e.target.value)} className={styles.select}>
        {options.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
